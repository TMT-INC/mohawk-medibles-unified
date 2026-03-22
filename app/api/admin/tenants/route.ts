// Mohawk Medibles — Tenant Admin API
// GET: List all tenants with performance metrics
// POST: Create a new tenant (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAllTenants } from '@/lib/tenant';
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const tenants = getAllTenants();

  // Get order counts and revenue per tenant from DB
  const tenantStats = await Promise.all(
    tenants.map(async (tenant) => {
      const orderAgg = await prisma.order.aggregate({
        where: { sourceTenant: tenant.slug },
        _count: true,
        _sum: { total: true },
      });

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentOrders = await prisma.order.aggregate({
        where: {
          sourceTenant: tenant.slug,
          createdAt: { gte: last30Days },
        },
        _count: true,
        _sum: { total: true },
      });

      return {
        ...tenant,
        stats: {
          totalOrders: orderAgg._count,
          totalRevenue: orderAgg._sum.total || 0,
          last30Days: {
            orders: recentOrders._count,
            revenue: recentOrders._sum.total || 0,
          },
          avgOrderValue: orderAgg._count > 0
            ? (orderAgg._sum.total || 0) / orderAgg._count
            : 0,
        },
      };
    })
  );

  return NextResponse.json({ tenants: tenantStats });
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isAuthError(auth)) return auth;

  if (auth.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Super admin required' }, { status: 403 });
  }

  const body = await req.json();

  const tenant = await prisma.tenant.create({
    data: {
      slug: body.slug,
      name: body.name,
      domain: body.domain,
      altDomains: body.altDomains || [],
      primaryColor: body.primaryColor || '#2D5016',
      secondaryColor: body.secondaryColor || '#F5E6C8',
      accentColor: body.accentColor || '#D4A574',
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
      categoryFilter: body.categoryFilter || [],
      subcategoryFilter: body.subcategoryFilter || [],
      tagFilter: body.tagFilter || [],
      regionFilter: body.regionFilter || [],
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: body.seoKeywords || [],
      paymentMethods: body.paymentMethods || [],
      etransferInstructions: body.etransferInstructions,
      gaPropertyId: body.gaPropertyId,
    },
  });

  return NextResponse.json({ tenant }, { status: 201 });
}
