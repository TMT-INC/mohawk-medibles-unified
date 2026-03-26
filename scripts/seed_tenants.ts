// Seed initial tenants into Neon DB
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Default tenant: Mohawk Medibles
  const mohawk = await prisma.tenant.upsert({
    where: { slug: 'mohawk-medibles' },
    create: {
      slug: 'mohawk-medibles',
      name: 'Mohawk Medibles',
      domain: 'mohawkmedibles.co',
      altDomains: ['mohawkmedibles.ca', 'mohawk-medibles-seo.vercel.app'],
      active: true,
      isDefault: true,
      primaryColor: '#2D5016',
      secondaryColor: '#F5E6C8',
      accentColor: '#D4A574',
      heroTitle: 'Premium Indigenous Cannabis',
      heroSubtitle: 'Tyendinaga Mohawk Territory — Empire Standard™ Quality',
      categoryFilter: [],
      subcategoryFilter: [],
      tagFilter: [],
      regionFilter: [],
      seoTitle: 'Mohawk Medibles | Premium Indigenous Cannabis — Tyendinaga',
      seoDescription: 'Indigenous-owned premium cannabis dispensary on Tyendinaga Mohawk Territory. 360+ lab-tested products. Ships Canada-wide.',
      seoKeywords: ['mohawk medibles', 'indigenous cannabis', 'tyendinaga dispensary', 'buy weed online canada'],
      paymentMethods: [],
      etransferInstructions: 'Send your Interac e-Transfer to the email in your order confirmation. Use your order number as the payment reference. Your order will be processed once payment is received.',
    },
    update: {
      name: 'Mohawk Medibles',
      active: true,
      isDefault: true,
    },
  });
  console.log(`✅ Mohawk Medibles tenant: ${mohawk.id}`);

  // Unhinged Cannabis
  const unhinged = await prisma.tenant.upsert({
    where: { slug: 'unhinged-cannabis' },
    create: {
      slug: 'unhinged-cannabis',
      name: 'Unhinged Cannabis',
      domain: 'unhingedcannabis.ca',
      altDomains: [],
      active: true,
      isDefault: false,
      primaryColor: '#FF4500',
      secondaryColor: '#1A1A2E',
      accentColor: '#E94560',
      heroTitle: 'Cannabis Without the Corporate BS',
      heroSubtitle: 'Raw. Real. Ridiculously Good.',
      categoryFilter: [],
      subcategoryFilter: [],
      tagFilter: [],
      regionFilter: [],
      seoTitle: 'Unhinged Cannabis | Premium Weed Delivered Canada-Wide',
      seoDescription: 'No filter. No filler. Just the best cannabis Canada has to offer. Lab-tested, hand-selected products shipped discreetly to your door.',
      seoKeywords: ['buy weed online canada', 'cannabis delivery', 'premium cannabis', 'weed delivery'],
      paymentMethods: [],
      etransferInstructions: 'Send your Interac e-Transfer using the details below. Reference your order number. We ship same day once payment clears.',
    },
    update: {
      name: 'Unhinged Cannabis',
      active: true,
    },
  });
  console.log(`✅ Unhinged Cannabis tenant: ${unhinged.id}`);

  // Show all tenants
  const all = await prisma.tenant.findMany();
  console.log(`\nTotal tenants: ${all.length}`);
  for (const t of all) {
    console.log(`  ${t.slug} → ${t.domain} (default: ${t.isDefault})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
