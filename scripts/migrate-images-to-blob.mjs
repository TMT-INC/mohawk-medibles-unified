/**
 * Migrate product images off mohawkmedibles.ca (WordPress wp-content) to
 * Vercel Blob, so the catalog survives the WP shutdown at cutover.
 *
 * Rewrites Product.image and ProductImage.url rows in place. Idempotent:
 * already-migrated rows (blob.vercel-storage.com) are skipped, and re-runs
 * only process whatever still points at mohawkmedibles.ca.
 *
 * Usage (from repo root, needs DATABASE_URL + BLOB_READ_WRITE_TOKEN):
 *   npx vercel env pull .mm-prod.tmp.env --environment production
 *   node --env-file=.mm-prod.tmp.env scripts/migrate-images-to-blob.mjs [--dry-run]
 */
import { Client } from "pg";
import { put } from "@vercel/blob";

const DRY = process.argv.includes("--dry-run");
const CONCURRENCY = 6;

function blobPath(url) {
    // .../wp-content/uploads/2025/09/foo.png → wp-media/2025/09/foo.png
    const m = url.match(/wp-content\/uploads\/(.+)$/);
    const tail = m ? m[1] : url.split("/").slice(-1)[0];
    return "wp-media/" + decodeURIComponent(tail.split("?")[0]);
}

async function migrateOne(url, cache) {
    if (cache.has(url)) return cache.get(url);
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`download ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) throw new Error("empty body");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (DRY) {
        cache.set(url, "(dry)");
        return "(dry)";
    }
    const blob = await put(blobPath(url), buf, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
    });
    cache.set(url, blob.url);
    return blob.url;
}

async function main() {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();

    const targets = [];
    for (const [table, idCol, col] of [
        ["Product", "id", "image"],
        ["ProductImage", "id", "url"],
    ]) {
        const rows = (await c.query(
            `select "${idCol}" as id, "${col}" as url from "${table}" where "${col}" like '%mohawkmedibles.ca%'`
        )).rows;
        rows.forEach((r) => targets.push({ table, col, id: r.id, url: r.url }));
    }
    console.log(`rows to migrate: ${targets.length} (${new Set(targets.map(t => t.url)).size} unique URLs)`);

    const cache = new Map();
    let done = 0, failed = 0;
    const failures = [];

    // simple concurrency pool
    const queue = [...targets];
    await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length) {
            const t = queue.shift();
            try {
                const newUrl = await migrateOne(t.url, cache);
                if (!DRY) {
                    await c.query(`update "${t.table}" set "${t.col}" = $1 where id = $2`, [newUrl, t.id]);
                }
                done++;
                if (done % 100 === 0) console.log(`progress: ${done}/${targets.length}`);
            } catch (e) {
                failed++;
                failures.push(`${t.table}#${t.id} ${t.url} — ${e.message}`);
            }
        }
    }));

    console.log(`DONE migrated=${done} failed=${failed}`);
    if (failures.length) {
        console.log("FAILURES:");
        failures.slice(0, 40).forEach((f) => console.log("  " + f));
    }
    await c.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
