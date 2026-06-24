/**
 * Fast targeted backfill of MISSING WooCommerce orders, by ID.
 * Reads all WC order IDs, diffs against Neon, fetches missing via `include=`
 * (100/batch, indexed), and writes them RACE-FREE + PARALLEL:
 *   per batch -> ensure all distinct products + users first (sequential/parallel,
 *   distinct keys = no upsert races) -> then write orders concurrently with
 *   createMany for line items. Idempotent (upserts). Logs to stderr (unbuffered).
 *
 * Run: npx tsx scripts/backfill_by_ids.ts <path-to-wc-id-list.txt>
 * Env: DATABASE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET, WC_STORE_URL
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { readFileSync } from 'fs';

const STATUS_MAP: Record<string, string> = { pending: 'PENDING', processing: 'PROCESSING', 'on-hold': 'ON_HOLD', completed: 'COMPLETED', cancelled: 'CANCELLED', refunded: 'REFUNDED', failed: 'FAILED', trash: 'CANCELLED' };
const payStatus = (s: string) => (['completed', 'processing'].includes(s) ? 'PAID' : s === 'refunded' ? 'REFUNDED' : s === 'failed' ? 'FAILED' : 'PENDING');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const transient = (m: string) => /timeout|terminated|connection|Closed|ECONNRESET|administrator|too many|socket/i.test(m);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const RETRY = new Set([403, 408, 425, 429, 500, 502, 503, 520, 522, 524]);
const CK = process.env.WC_CONSUMER_KEY!, CS = process.env.WC_CONSUMER_SECRET!;
const STORE = (process.env.WC_STORE_URL || 'https://mohawkmedibles.ca').replace(/\/$/, '');
const pmap = new Map<number, number>(); // wcId -> product.id

async function fetchByIds(ids: number[]): Promise<any[]> {
  const url = `${STORE}/wp-json/wc/v3/orders?per_page=100&include=${ids.join(',')}&consumer_key=${CK}&consumer_secret=${CS}`;
  for (let a = 1; a <= 6; a++) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 60000);
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA }, signal: ctl.signal });
      clearTimeout(t);
      if (r.ok) return (await r.json()) as any[];
      if (RETRY.has(r.status) && a < 6) { await sleep(1000 * a); continue; }
      throw new Error(`WC ${r.status}`);
    } catch (e) { clearTimeout(t); if (a < 6) { await sleep(1000 * a); continue; } throw e; }
  }
  return [];
}

function makeClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10, statement_timeout: 40000, query_timeout: 40000, connectionTimeoutMillis: 15000, keepAlive: true });
  pool.on('error', () => {});
  return { pool, prisma: new PrismaClient({ adapter: new PrismaPg(pool) }) };
}

async function mapLimit<T>(items: T[], limit: number, fn: (x: T) => Promise<void>) {
  let idx = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) { const i = idx++; await fn(items[i]); }
  }));
}
async function retry<T>(fn: () => Promise<T>): Promise<T> {
  for (let a = 1; a <= 3; a++) {
    try { return await fn(); }
    catch (e: any) { if (a < 3 && transient(e?.message || '')) { await sleep(1000 * a); continue; } throw e; }
  }
  throw new Error('unreachable');
}
const ukey = (wc: any) => (wc.customer_id > 0 ? `c:${wc.customer_id}` : `e:${(wc.billing?.email || `guest-order-${wc.id}`).toLowerCase()}`);

async function resolveUser(prisma: PrismaClient, wc: any): Promise<string> {
  if (wc.customer_id > 0) {
    const u = await prisma.user.findUnique({ where: { wcCustomerId: wc.customer_id } });
    if (u) return u.id;
    const email = wc.billing?.email || `guest-${wc.customer_id}@mohawkmedibles.ca`;
    const name = [wc.billing?.first_name, wc.billing?.last_name].filter(Boolean).join(' ') || 'Guest';
    const c = await prisma.user.upsert({ where: { email }, create: { wcCustomerId: wc.customer_id, email, passwordHash: '', name, phone: wc.billing?.phone || null }, update: { wcCustomerId: wc.customer_id } });
    return c.id;
  }
  const email = wc.billing?.email || `guest-order-${wc.id}@mohawkmedibles.ca`;
  const name = [wc.billing?.first_name, wc.billing?.last_name].filter(Boolean).join(' ') || 'Guest';
  const g = await prisma.user.upsert({ where: { email }, create: { email, passwordHash: '', name, phone: wc.billing?.phone || null }, update: {} });
  return g.id;
}

async function run() {
  const allIds = readFileSync(process.argv[2], 'utf8').split('\n').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
  let { pool, prisma } = makeClient();

  // preload product map + existing order ids
  const prods = await prisma.product.findMany({ select: { id: true, wcId: true }, where: { wcId: { not: null } } });
  for (const p of prods) pmap.set(p.wcId as number, p.id);
  const rows = await prisma.order.findMany({ select: { wcOrderId: true }, where: { wcOrderId: { not: null } } });
  const existing = new Set<number>(rows.map((r) => r.wcOrderId as number));
  const missing = allIds.filter((id) => !existing.has(id));
  console.error(`WC ids=${allIds.length}, Neon has=${existing.size}, products=${pmap.size}, missing=${missing.length}`);

  let created = 0, items = 0, failed = 0, batchNum = 0;
  const BATCH = 100;
  const totalBatches = Math.ceil(missing.length / BATCH);

  for (let i = 0; i < missing.length; i += BATCH) {
    batchNum++;
    const ids = missing.slice(i, i + BATCH);
    let orders: any[];
    try { orders = await fetchByIds(ids); }
    catch (e: any) { console.error(`batch ${batchNum} fetch FAIL: ${e.message?.slice(0, 80)}`); failed += ids.length; continue; }
    if (!orders.length) { console.error(`batch ${batchNum}/${totalBatches} fetched=0 (skip-status) created=${created}`); continue; }

    try {
      // 1) ensure all distinct products exist (placeholders) — distinct => no races
      const needProd = new Set<number>();
      for (const wc of orders) for (const it of (wc.line_items || [])) if (it.product_id != null && !pmap.has(it.product_id)) needProd.add(it.product_id);
      await mapLimit([...needProd], 6, async (pid) => {
        const ph = await retry(() => prisma.product.upsert({ where: { wcId: pid }, create: { wcId: pid, slug: `wc-product-${pid}`, name: `wc-product-${pid}`, category: 'Uncategorized', price: 0, canonicalUrl: '', path: `/product/wc-product-${pid}/`, image: '', altText: '', metaDescription: '', shortDescription: '' }, update: {} }));
        pmap.set(pid, ph.id);
      });

      // 2) ensure all distinct users — distinct keys => no races
      const reps = new Map<string, any>();
      for (const wc of orders) { const k = ukey(wc); if (!reps.has(k)) reps.set(k, wc); }
      const userMap = new Map<string, string>();
      await mapLimit([...reps.values()], 5, async (wc) => { userMap.set(ukey(wc), await retry(() => resolveUser(prisma, wc))); });

      // 3) write orders concurrently
      await mapLimit(orders, 8, async (wc) => {
        try {
          const userId = userMap.get(ukey(wc))!;
          const subtotal = wc.line_items?.reduce((s: number, it: any) => s + parseFloat(it.total || '0'), 0) || 0;
          const order = await retry(() => prisma.order.upsert({
            where: { wcOrderId: wc.id },
            update: { status: (STATUS_MAP[wc.status] || 'PENDING') as any, paymentStatus: payStatus(wc.status) as any, total: parseFloat(wc.total) || 0 },
            create: { wcOrderId: wc.id, wcOrderKey: wc.order_key, orderNumber: `MM-${wc.id}`, userId, status: (STATUS_MAP[wc.status] || 'PENDING') as any, subtotal, shippingCost: parseFloat(wc.shipping_total) || 0, tax: parseFloat(wc.total_tax) || 0, discount: parseFloat(wc.discount_total) || 0, total: parseFloat(wc.total) || 0, currency: wc.currency || 'CAD', paymentMethod: wc.payment_method || null, paymentMethodTitle: wc.payment_method_title || null, paymentReference: wc.transaction_id || null, paymentStatus: payStatus(wc.status) as any, customerNote: wc.customer_note || null, ipAddress: wc.customer_ip_address || null, billingData: JSON.stringify(wc.billing), shippingData: JSON.stringify(wc.shipping), createdAt: new Date(wc.date_created) },
          }));
          await retry(() => prisma.orderItem.deleteMany({ where: { orderId: order.id } }));
          const data = (wc.line_items || []).map((it: any) => ({ orderId: order.id, productId: pmap.get(it.product_id)!, quantity: it.quantity, price: it.price || parseFloat(it.total) / (it.quantity || 1), total: parseFloat(it.total) || 0, name: it.name })).filter((d: any) => d.productId != null);
          if (data.length) { await retry(() => prisma.orderItem.createMany({ data })); items += data.length; }
          created++;
        } catch (e: any) { failed++; if (failed <= 30) console.error(`order ${wc.id} FAIL: ${(e.message || '').slice(0, 90)}`); }
      });
    } catch (e: any) { console.error(`batch ${batchNum} FAIL: ${(e.message || '').slice(0, 90)}`); }

    console.error(`batch ${batchNum}/${totalBatches} fetched=${orders.length} created=${created} items=${items} failed=${failed}`);
    if (batchNum % 30 === 0) { try { await prisma.$disconnect(); await pool.end(); } catch {}; ({ pool, prisma } = makeClient()); }
  }

  const finalCount = await prisma.order.count();
  console.error(`\nDONE. created=${created} items=${items} failed=${failed}`);
  console.error(`Neon order count now: ${finalCount}`);
  await prisma.$disconnect(); await pool.end();
}
run().catch((e) => { console.error('FATAL', e); process.exit(1); });
