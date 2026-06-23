// Mohawk Medibles — WooCommerce REST API Client
// Pure fetch, zero SDKs. Handles pagination, rate limiting, error recovery.

const WC_STORE_URL = process.env.WC_STORE_URL || 'https://mohawkmedibles.ca';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || '';

const MAX_PER_PAGE = 100;
const RATE_LIMIT_MS = 500; // 2 requests/sec to be safe on WP Engine

interface WCRequestOptions {
  endpoint: string;
  params?: Record<string, string | number>;
  version?: 'v3' | 'store/v1';
}

interface WCPaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl({ endpoint, params = {}, version = 'v3' }: WCRequestOptions): string {
  const base = version === 'v3'
    ? `${WC_STORE_URL}/wp-json/wc/v3/${endpoint}`
    : `${WC_STORE_URL}/wp-json/wc/store/v1/${endpoint}`;

  const url = new URL(base);

  // v3 needs auth via query params
  if (version === 'v3') {
    url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
    url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);
  }

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

// Cloudflare's bot-fight mode challenges non-browser User-Agents and bursts.
// Present a real browser UA and retry transient / challenge statuses with
// backoff — without this, ~1/3 of paginated requests get 403'd and silently
// dropped (the cause of the historical order-backfill gaps).
const WC_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const RETRYABLE_STATUSES = new Set([403, 408, 425, 429, 500, 502, 503, 520, 522, 524]);

async function wcFetch<T>(options: WCRequestOptions): Promise<WCPaginatedResult<T>> {
  const url = buildUrl(options);
  const maxAttempts = 6;
  let lastErr: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'User-Agent': WC_UA },
      });

      if (!response.ok) {
        if (RETRYABLE_STATUSES.has(response.status) && attempt < maxAttempts) {
          await sleep(1000 * attempt);
          continue;
        }
        const body = await response.text();
        throw new Error(`WC API ${response.status}: ${body.slice(0, 200)}`);
      }

      const data = await response.json() as T[];
      const total = parseInt(response.headers.get('x-wp-total') || '0', 10);
      const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '0', 10);
      const page = Number(options.params?.page || 1);

      return { data, total, totalPages, page };
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        await sleep(1000 * attempt);
        continue;
      }
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error('WC API request failed');
}

// ─── Products (via Store API v1 — no auth, bypasses plugin bug) ────

export interface WCStoreProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
    price_range?: { min_amount: string; max_amount: string } | null;
  };
  images: Array<{ id: number; src: string; name: string; alt: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{ id: number; name: string; taxonomy: string; has_variations: boolean; terms: Array<{ id: number; name: string; slug: string }> }>;
  on_sale: boolean;
  is_in_stock: boolean;
  average_rating: string;
  review_count: number;
}

export async function fetchAllProducts(
  onProgress?: (synced: number, total: number) => void
): Promise<WCStoreProduct[]> {
  const allProducts: WCStoreProduct[] = [];
  let page = 1;

  // First request to get total
  const first = await wcFetch<WCStoreProduct>({
    endpoint: 'products',
    version: 'store/v1',
    params: { per_page: MAX_PER_PAGE, page: 1 },
  });

  allProducts.push(...first.data);
  const totalPages = first.totalPages;
  onProgress?.(allProducts.length, first.total);

  // Paginate remaining
  for (page = 2; page <= totalPages; page++) {
    await sleep(RATE_LIMIT_MS);
    const result = await wcFetch<WCStoreProduct>({
      endpoint: 'products',
      version: 'store/v1',
      params: { per_page: MAX_PER_PAGE, page },
    });
    allProducts.push(...result.data);
    onProgress?.(allProducts.length, first.total);
  }

  return allProducts;
}

// ─── Customers (via REST API v3 — authenticated) ─────────────

export interface WCCustomer {
  id: number;
  date_created: string;
  date_modified: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  orders_count: number;
  total_spent: string;
  avatar_url: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
  };
}

export async function fetchCustomers(
  options: { page?: number; perPage?: number; modifiedAfter?: string } = {},
  onProgress?: (synced: number, total: number) => void
): Promise<{ customers: WCCustomer[]; total: number; totalPages: number }> {
  const { page = 1, perPage = MAX_PER_PAGE, modifiedAfter } = options;
  const params: Record<string, string | number> = {
    per_page: perPage,
    page,
    orderby: 'registered_date',
    order: 'desc',
  };
  if (modifiedAfter) params.modified_after = modifiedAfter;

  const result = await wcFetch<WCCustomer>({ endpoint: 'customers', params });
  onProgress?.(result.data.length, result.total);

  return { customers: result.data, total: result.total, totalPages: result.totalPages };
}

export async function fetchAllCustomers(
  modifiedAfter?: string,
  onProgress?: (synced: number, total: number) => void
): Promise<WCCustomer[]> {
  const allCustomers: WCCustomer[] = [];

  const first = await fetchCustomers({ page: 1, modifiedAfter });
  allCustomers.push(...first.customers);
  onProgress?.(allCustomers.length, first.total);

  for (let page = 2; page <= first.totalPages; page++) {
    await sleep(RATE_LIMIT_MS);
    try {
      const result = await fetchCustomers({ page, modifiedAfter });
      allCustomers.push(...result.customers);
      onProgress?.(allCustomers.length, first.total);
    } catch (err) {
      console.error(`[WC] Customer page ${page} failed:`, err);
      // Continue with next page rather than failing entire sync
    }
  }

  return allCustomers;
}

// ─── Orders (via REST API v3 — authenticated) ─────────────────

export interface WCOrder {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  date_created: string;
  date_modified: string;
  discount_total: string;
  shipping_total: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_note: string;
  billing: WCCustomer['billing'];
  shipping: WCCustomer['shipping'];
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    subtotal: string;
    total: string;
    sku: string;
    price: number;
  }>;
  shipping_lines: Array<{
    id: number;
    method_title: string;
    method_id: string;
    total: string;
  }>;
  meta_data: Array<{ id: number; key: string; value: string }>;
}

export async function fetchOrders(
  options: { page?: number; perPage?: number; modifiedAfter?: string; status?: string } = {},
  onProgress?: (synced: number, total: number) => void
): Promise<{ orders: WCOrder[]; total: number; totalPages: number }> {
  const { page = 1, perPage = MAX_PER_PAGE, modifiedAfter, status } = options;
  const params: Record<string, string | number> = {
    per_page: perPage,
    page,
    orderby: 'date',
    order: 'desc',
  };
  if (modifiedAfter) params.modified_after = modifiedAfter;
  if (status) params.status = status;

  const result = await wcFetch<WCOrder>({ endpoint: 'orders', params });
  onProgress?.(result.data.length, result.total);

  return { orders: result.data, total: result.total, totalPages: result.totalPages };
}

export async function fetchAllOrders(
  modifiedAfter?: string,
  onProgress?: (synced: number, total: number, page: number) => void
): Promise<WCOrder[]> {
  const allOrders: WCOrder[] = [];

  const first = await fetchOrders({ page: 1, modifiedAfter });
  allOrders.push(...first.orders);
  onProgress?.(allOrders.length, first.total, 1);

  for (let page = 2; page <= first.totalPages; page++) {
    await sleep(RATE_LIMIT_MS);
    try {
      const result = await fetchOrders({ page, modifiedAfter });
      allOrders.push(...result.orders);
      onProgress?.(allOrders.length, first.total, page);
    } catch (err) {
      console.error(`[WC] Order page ${page} failed:`, err);
    }
  }

  return allOrders;
}

// ─── Shipping / Payment Gateways (v3) ────────────────────────

export interface WCPaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  method_title: string;
  method_description: string;
  settings: Record<string, { id: string; label: string; value: string }>;
}

export async function fetchPaymentGateways(): Promise<WCPaymentGateway[]> {
  const result = await wcFetch<WCPaymentGateway>({ endpoint: 'payment_gateways' });
  return result.data;
}

export interface WCShippingZone {
  id: number;
  name: string;
  order: number;
}

export async function fetchShippingZones(): Promise<WCShippingZone[]> {
  const result = await wcFetch<WCShippingZone>({ endpoint: 'shipping/zones' });
  return result.data;
}

// ─── Single resource fetchers ─────────────────────────────────

export async function fetchOrder(orderId: number): Promise<WCOrder> {
  const result = await wcFetch<WCOrder>({ endpoint: `orders/${orderId}` });
  return result.data[0] || (await wcFetch<WCOrder>({ endpoint: `orders/${orderId}` })).data[0];
}

export async function fetchCustomer(customerId: number): Promise<WCCustomer> {
  const url = buildUrl({ endpoint: `customers/${customerId}` });
  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) throw new Error(`WC API ${response.status}`);
  return response.json() as Promise<WCCustomer>;
}
