import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { log } from '@/lib/logger';
import { fetchAllProducts, type WCStoreProduct } from '@/lib/wc-api';

// ─── Excluded Categories ────────────────────────────────────
// Products in these categories are NOT synced to the storefront
const EXCLUDED_CATEGORIES = new Set([
  'nicotine', 'sexual enhancement', 'enhancement pills',
  'mushrooms', 'hookah',
  'ijoy', 'geek bar', 'flavour beast', 'flying horse', 'lip rippers',
  'euphoria psychedelics', 'her highness from the 6ix',
]);

function isExcludedProduct(wcProduct: WCStoreProduct): boolean {
  return (wcProduct.categories || []).some(
    (c) => EXCLUDED_CATEGORIES.has(c.name.toLowerCase())
  );
}

// POST /api/sync/products — Full product sync from WooCommerce Store API
export async function POST(req: NextRequest) {
  // Simple auth check — require AUTH_SECRET header
  const authHeader = req.headers.get('x-sync-secret');
  if (authHeader !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const syncLog = await prisma.syncLog.create({
    data: { endpoint: 'products', status: 'running' },
  });

  try {
    let synced = 0;
    const products = await fetchAllProducts((s, t) => {
      synced = s;
      log.wc.info("Products fetch progress", { fetched: s, total: t });
    });

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { recordsTotal: products.length },
    });

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const wcProduct of products) {
      // Skip excluded categories (nicotine, mushrooms, sexual enhancement, etc.)
      if (isExcludedProduct(wcProduct)) {
        skippedCount++;
        continue;
      }

      try {
        const category = wcProduct.categories?.[0]?.name || 'Uncategorized';
        const subcategory = wcProduct.categories?.[1]?.name || null;
        const priceRaw = wcProduct.prices?.price || '0';
        const price = parseFloat(priceRaw) / 100; // Store API returns cents
        const salePrice = wcProduct.prices?.sale_price
          ? parseFloat(wcProduct.prices.sale_price) / 100
          : null;

        // Extract attributes
        const getAttr = (name: string) =>
          wcProduct.attributes?.find(
            (a) => a.name.toLowerCase() === name.toLowerCase()
          )?.terms?.[0]?.name || null;

        await prisma.product.upsert({
          where: { wcId: wcProduct.id },
          create: {
            wcId: wcProduct.id,
            slug: wcProduct.slug,
            name: wcProduct.name,
            category,
            subcategory,
            price,
            salePrice: salePrice && salePrice < price ? salePrice : null,
            sku: wcProduct.sku || null,
            canonicalUrl: wcProduct.permalink,
            path: `/product/${wcProduct.slug}/`,
            image: wcProduct.images?.[0]?.src || '',
            altText: wcProduct.images?.[0]?.alt || wcProduct.name,
            metaDescription: wcProduct.short_description?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
            shortDescription: wcProduct.short_description?.replace(/<[^>]*>/g, '') || '',
            longDescription: wcProduct.description || null,
            featured: false,
            status: wcProduct.is_in_stock ? 'ACTIVE' : 'OUT_OF_STOCK',
            specs: {
              create: {
                thc: getAttr('THC'),
                cbd: getAttr('CBD'),
                type: getAttr('Type') || getAttr('Strain Type'),
                weight: getAttr('Weight') || getAttr('Size'),
              },
            },
            images: {
              create: wcProduct.images?.map((img, i) => ({
                url: img.src,
                altText: img.alt || wcProduct.name,
                position: i,
              })) || [],
            },
            inventory: {
              create: {
                quantity: wcProduct.is_in_stock ? 100 : 0, // Store API doesn't expose exact stock
                backorder: false,
              },
            },
          },
          update: {
            name: wcProduct.name,
            category,
            subcategory,
            price,
            salePrice: salePrice && salePrice < price ? salePrice : null,
            sku: wcProduct.sku || null,
            canonicalUrl: wcProduct.permalink,
            image: wcProduct.images?.[0]?.src || '',
            altText: wcProduct.images?.[0]?.alt || wcProduct.name,
            shortDescription: wcProduct.short_description?.replace(/<[^>]*>/g, '') || '',
            longDescription: wcProduct.description || null,
            status: wcProduct.is_in_stock ? 'ACTIVE' : 'OUT_OF_STOCK',
          },
        });

        successCount++;
      } catch (err) {
        failCount++;
        log.wc.error("Failed to upsert product", { wcProductId: wcProduct.id, slug: wcProduct.slug, error: err instanceof Error ? err.message : "Unknown" });
      }
    }

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'completed',
        recordsSynced: successCount,
        recordsFailed: failCount,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      total: products.length,
      synced: successCount,
      skipped: skippedCount,
      failed: failCount,
    });
  } catch (err: any) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { status: 'failed', error: err.message, completedAt: new Date() },
    });

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/sync/products — Check sync status
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('x-sync-secret');
  if (authHeader !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lastSync = await prisma.syncLog.findFirst({
    where: { endpoint: 'products' },
    orderBy: { startedAt: 'desc' },
  });

  const productCount = await prisma.product.count();

  return NextResponse.json({ lastSync, productCount });
}
