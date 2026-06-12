/**
 * End-to-end payment-flow test against the live deployment (.co):
 *   1. Places a real e-transfer order via /api/checkout
 *   2. Fires HMAC-signed Wampum postbacks (transfer-received → deposit-confirmed)
 *   3. Verifies the order walks ON_HOLD → PAYMENT_CONFIRMED / PAID
 *   4. Places a crypto order and verifies a BTCPay invoice URL comes back
 *   5. Cleans up: deletes test orders/items/history and restores inventory
 *
 * Needs .mm-prod.tmp.env (vercel env pull) for DATABASE_URL + WAMPUM_HMAC_SECRET.
 *   node --env-file=.mm-prod.tmp.env scripts/e2e-wampum-test.mjs
 */
import crypto from "node:crypto";
import { Client } from "pg";

const BASE = "https://mohawkmedibles.co";
const TEST_EMAIL = "iancweed+launchtest@gmail.com";
const HMAC = (process.env.WAMPUM_HMAC_SECRET || "").trim();

const db = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

function sign(body) {
    return crypto.createHmac("sha256", HMAC).update(body).digest("hex");
}

async function wampumPost(path, payload) {
    const body = JSON.stringify(payload);
    const r = await fetch(`${BASE}/api/webhooks/wampum/${path}/`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-wampum-signature": sign(body) },
        body,
    });
    return { status: r.status, json: await r.json().catch(() => ({})) };
}

async function checkout(paymentMethod, productId) {
    const r = await fetch(`${BASE}/api/checkout/`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            items: [{ productId, quantity: 1 }],
            billing: {
                first_name: "Launch", last_name: "Test", email: TEST_EMAIL,
                address_1: "1 Test Rd", city: "Deseronto", state: "ON", postcode: "K0K 1X0",
            },
            payment_method: paymentMethod,
        }),
    });
    return { status: r.status, json: await r.json().catch(() => ({})) };
}

async function orderState(orderNumber) {
    const { rows } = await db.query(
        'select id, status, "paymentStatus", "paymentReference", notes from "Order" where "orderNumber" = $1', [orderNumber]);
    return rows[0];
}

async function cleanup(orderNumber) {
    const o = await orderState(orderNumber);
    if (!o) return;
    const items = (await db.query('select "productId", quantity from "OrderItem" where "orderId" = $1', [o.id])).rows;
    for (const it of items) {
        await db.query('update "Inventory" set quantity = quantity + $1 where "productId" = $2', [it.quantity, it.productId]);
    }
    await db.query('delete from "OrderItem" where "orderId" = $1', [o.id]);
    await db.query('delete from "OrderStatusHistory" where "orderId" = $1', [o.id]);
    await db.query('delete from "FraudCheck" where "orderId" = $1', [o.id]).catch(() => {});
    await db.query('delete from "Order" where id = $1', [o.id]);
    console.log(`  cleaned up ${orderNumber} (restocked ${items.length} items)`);
}

async function main() {
    if (!HMAC) throw new Error("WAMPUM_HMAC_SECRET missing from env");
    await db.connect();

    // cheapest active product with stock
    const prod = (await db.query(`
        select p.id, p.name, p.price from "Product" p
        join "Inventory" i on i."productId" = p.id
        where p.status = 'ACTIVE' and i.quantity > 2
        order by p.price asc limit 1`)).rows[0];
    console.log("test product:", prod.id, prod.name, "$" + prod.price);

    // ── 1. e-Transfer order ──
    const co = await checkout("etransfer", prod.id);
    console.log("checkout (etransfer):", co.status, co.json.orderNumber, "| recipient:", co.json.etransfer?.email, "| memo:", co.json.etransfer?.memo);
    if (co.status !== 200) throw new Error("checkout failed: " + JSON.stringify(co.json));
    const on = co.json.orderNumber;
    console.log("  state after checkout:", JSON.stringify(await orderState(on), (k, v) => k === "notes" || k === "id" ? undefined : v));

    // ── 2. transfer-received ──
    const recv = await wampumPost("transfer-received", { order_number: on, amount: co.json.total, currency: "CAD" });
    console.log("transfer-received:", recv.status, JSON.stringify(recv.json));

    // ── 3. deposit-confirmed (nested payload) ──
    const dep = await wampumPost("deposit-confirmed", {
        transaction: {
            order_number: on, reference: "TESTREF123", amount: co.json.total,
            sender_name: "Launch Test", source_bank: "TestBank", blacfin_operator_confirmed: "e2e-script",
        },
    });
    console.log("deposit-confirmed:", dep.status, JSON.stringify(dep.json));
    const after = await orderState(on);
    console.log("  state after deposit:", after.status, after.paymentStatus, "ref:", after.paymentReference);
    const pass1 = after.status === "PAYMENT_CONFIRMED" && after.paymentStatus === "PAID" && after.paymentReference === "TESTREF123";
    console.log(pass1 ? "✅ e-transfer flow PASS" : "❌ e-transfer flow FAIL");

    // redelivery idempotency
    const dep2 = await wampumPost("deposit-confirmed", { transaction: { order_number: on, reference: "TESTREF123" } });
    console.log("redelivery:", dep2.status, "already_processed:", dep2.json.already_processed === true ? "✅" : "❌ " + JSON.stringify(dep2.json));

    await cleanup(on);

    // ── 4. crypto order ──
    const cc = await checkout("crypto", prod.id);
    const payUrl = cc.json.payUrl || "";
    console.log("checkout (crypto):", cc.status, cc.json.orderNumber, "| payUrl:", payUrl.slice(0, 60));
    const pass2 = cc.status === 200 && payUrl.startsWith("https://btc.paymohawk.com/");
    console.log(pass2 ? "✅ crypto invoice PASS" : "❌ crypto invoice FAIL " + JSON.stringify(cc.json).slice(0, 300));
    if (cc.json.orderNumber) {
        const co2 = await orderState(cc.json.orderNumber);
        if (co2?.paymentReference) console.log("  invoice id linked:", co2.paymentReference);
        await cleanup(cc.json.orderNumber);
    }

    await db.end();
    process.exit(pass1 && pass2 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
