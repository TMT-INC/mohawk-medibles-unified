// Mohawk Medibles — Multi-Tenant Resolution
// Resolves tenant by hostname. Provides React context for tenant-aware rendering.

import { headers } from 'next/headers';

// ─── Types ───────────────────────────────────────────────────

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  domain: string;
  altDomains: string[];
  active: boolean;
  isDefault: boolean;

  // Branding
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImage: string | null;
  aboutText: string | null;

  // Product filters
  categoryFilter: string[];
  subcategoryFilter: string[];
  tagFilter: string[];
  regionFilter: string[];
  priceMin: number | null;
  priceMax: number | null;

  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  ogImage: string | null;

  // Checkout
  paymentMethods: string[];
  checkoutRedirectUrl: string | null;
  etransferInstructions: string | null;

  // Analytics
  gaPropertyId: string | null;
}

// ─── Default Tenant (Mohawk Medibles) ────────────────────────

const DEFAULT_TENANT: TenantConfig = {
  id: 'default',
  slug: 'mohawk-medibles',
  name: 'Mohawk Medibles',
  domain: 'mohawkmedibles.ca',
  altDomains: ['mohawkmedibles.ca', 'mohawk-medibles-seo.vercel.app', 'localhost:3000', 'localhost:3001'],
  active: true,
  isDefault: true,

  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#2D5016',
  secondaryColor: '#F5E6C8',
  accentColor: '#D4A574',
  heroTitle: 'Premium Indigenous Cannabis',
  heroSubtitle: 'Six Nations of the Grand River — Empire Standard™ Quality',
  heroImage: null,
  aboutText: null,

  categoryFilter: [],
  subcategoryFilter: [],
  tagFilter: [],
  regionFilter: [],
  priceMin: null,
  priceMax: null,

  seoTitle: 'Mohawk Medibles | Premium Indigenous Cannabis — Six Nations',
  seoDescription: 'Indigenous-owned premium cannabis dispensary on Six Nations territory. 344+ lab-tested products. Ships Canada-wide.',
  seoKeywords: ['mohawk medibles', 'indigenous cannabis', 'six nations dispensary'],
  ogImage: '/og-image.png',

  paymentMethods: [],
  checkoutRedirectUrl: null,
  etransferInstructions: null,

  gaPropertyId: null,
};

// ─── Static Tenant Registry (Phase 1 — before DB migration) ──

const TENANT_REGISTRY: TenantConfig[] = [
  DEFAULT_TENANT,
  {
    id: 'unhinged-cannabis',
    slug: 'unhinged-cannabis',
    name: 'Unhinged Cannabis',
    domain: 'unhingedcannabis.ca',
    altDomains: [],
    active: true,
    isDefault: false,

    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#FF4500',
    secondaryColor: '#1A1A2E',
    accentColor: '#E94560',
    heroTitle: 'Cannabis Without the Corporate BS',
    heroSubtitle: 'Raw. Real. Ridiculously Good.',
    heroImage: null,
    aboutText: null,

    categoryFilter: [],
    subcategoryFilter: [],
    tagFilter: [],
    regionFilter: [],
    priceMin: null,
    priceMax: null,

    seoTitle: 'Unhinged Cannabis | Premium Weed Delivered Canada-Wide',
    seoDescription: 'No filter. No filler. Just the best cannabis Canada has to offer. Lab-tested, hand-selected products shipped discreetly to your door.',
    seoKeywords: ['buy weed online canada', 'cannabis delivery', 'premium cannabis'],
    ogImage: null,

    paymentMethods: [],
    checkoutRedirectUrl: null,
    etransferInstructions: null,

    gaPropertyId: null,
  },
];

// ─── Domain → Tenant lookup map ──────────────────────────────

function buildDomainMap(): Map<string, TenantConfig> {
  const map = new Map<string, TenantConfig>();
  for (const tenant of TENANT_REGISTRY) {
    // Primary domain
    map.set(tenant.domain.toLowerCase(), tenant);
    // Alt domains
    for (const alt of tenant.altDomains) {
      map.set(alt.toLowerCase(), tenant);
    }
  }
  return map;
}

const domainMap = buildDomainMap();

// ─── Resolution Functions ────────────────────────────────────

/**
 * Resolve tenant from a hostname string.
 * Falls back to default tenant if no match.
 */
export function resolveTenantByHost(host: string): TenantConfig {
  const hostLower = host.toLowerCase();
  const hostname = hostLower.replace(/:\d+$/, '');

  // Try exact match with port first, then without
  const tenant = domainMap.get(hostLower) || domainMap.get(hostname);
  if (tenant && tenant.active) return tenant;

  // Check if it's a Vercel preview URL containing a tenant slug
  for (const t of TENANT_REGISTRY) {
    if (hostname.includes(t.slug) && t.active) return t;
  }

  // Default fallback
  return DEFAULT_TENANT;
}

/**
 * Resolve tenant from incoming request headers (server components).
 * Reads x-tenant-slug header set by middleware, or falls back to host detection.
 */
export async function getCurrentTenant(): Promise<TenantConfig> {
  const h = await headers();

  // First try middleware-injected header
  const tenantSlug = h.get('x-tenant-slug');
  if (tenantSlug) {
    const tenant = TENANT_REGISTRY.find(t => t.slug === tenantSlug && t.active);
    if (tenant) return tenant;
  }

  // Fallback to host detection
  const host = h.get('host') || h.get('x-forwarded-host') || 'localhost:3000';
  return resolveTenantByHost(host);
}

/**
 * Get tenant by slug (for API routes, admin dashboard).
 */
export function getTenantBySlug(slug: string): TenantConfig | null {
  return TENANT_REGISTRY.find(t => t.slug === slug && t.active) || null;
}

/**
 * Get all active tenants (for admin dashboard).
 */
export function getAllTenants(): TenantConfig[] {
  return TENANT_REGISTRY.filter(t => t.active);
}

/**
 * Get the default tenant.
 */
export function getDefaultTenant(): TenantConfig {
  return DEFAULT_TENANT;
}

// ─── Product Filter Builder ──────────────────────────────────

export interface TenantProductFilter {
  categories?: string[];
  subcategories?: string[];
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
}

/**
 * Build a Prisma-compatible where clause for filtering products by tenant.
 */
export function buildProductFilter(tenant: TenantConfig): TenantProductFilter {
  const filter: TenantProductFilter = {};

  if (tenant.categoryFilter.length > 0) {
    filter.categories = tenant.categoryFilter;
  }
  if (tenant.subcategoryFilter.length > 0) {
    filter.subcategories = tenant.subcategoryFilter;
  }
  if (tenant.tagFilter.length > 0) {
    filter.tags = tenant.tagFilter;
  }
  if (tenant.priceMin != null) {
    filter.priceMin = tenant.priceMin;
  }
  if (tenant.priceMax != null) {
    filter.priceMax = tenant.priceMax;
  }

  return filter;
}

/**
 * Build Prisma where clause for product queries.
 */
export function buildPrismaProductWhere(tenant: TenantConfig) {
  const where: Record<string, unknown> = { status: 'ACTIVE' };

  if (tenant.categoryFilter.length > 0) {
    where.category = { in: tenant.categoryFilter };
  }
  if (tenant.subcategoryFilter.length > 0) {
    where.subcategory = { in: tenant.subcategoryFilter };
  }
  if (tenant.priceMin != null || tenant.priceMax != null) {
    where.price = {};
    if (tenant.priceMin != null) (where.price as Record<string, number>).gte = tenant.priceMin;
    if (tenant.priceMax != null) (where.price as Record<string, number>).lte = tenant.priceMax;
  }

  return where;
}
