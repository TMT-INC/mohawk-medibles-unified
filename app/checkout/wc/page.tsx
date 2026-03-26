'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useTenant } from '@/lib/tenant-context';

// ─── Constants ────────────────────────────────────────────────

const CANADIAN_PROVINCES = [
  { code: 'ON', name: 'Ontario' },
  { code: 'QC', name: 'Quebec' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'AB', name: 'Alberta' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'YT', name: 'Yukon' },
  { code: 'NU', name: 'Nunavut' },
] as const;

const FREE_SHIPPING_MIN = 149;
const FLAT_RATE_SHIPPING = 15;
const HST_RATE = 0; // Tax-free — Indigenous sovereignty (Tyendinaga Mohawk Territory)

// ─── Types ────────────────────────────────────────────────────

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface BillingForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
}

interface OrderSuccessData {
  orderId: number;
  orderNumber: string;
  total: string;
  etransfer?: {
    instructions: string;
    orderReference: string;
  };
}

// ─── Validation ───────────────────────────────────────────────

function validateBilling(billing: BillingForm): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!billing.first_name.trim()) errors.first_name = 'First name is required';
  if (!billing.last_name.trim()) errors.last_name = 'Last name is required';
  if (!billing.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!billing.address_1.trim()) errors.address_1 = 'Address is required';
  if (!billing.city.trim()) errors.city = 'City is required';
  if (!billing.state) errors.state = 'Province is required';
  if (!billing.postcode.trim()) {
    errors.postcode = 'Postal code is required';
  } else if (!/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(billing.postcode.trim())) {
    errors.postcode = 'Enter a valid Canadian postal code (e.g. K1A 0B1)';
  }

  return errors;
}

// ─── Payment Method Icon ──────────────────────────────────────

function PaymentIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'credit-card':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      );
    case 'interac':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      );
    case 'crypto':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738.145l-1.573 1.181a1.413 1.413 0 00-.135.123L9.6 13.16a2.084 2.084 0 01-.76.488l-1.573.63A2.25 2.25 0 005.5 16.41V19.5M3 12l2.25 2.25L12 7.5" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

// ─── Main Component ───────────────────────────────────────────

export default function WCCheckoutPage() {
  const { items, total, clearCart } = useCart();
  const tenant = useTenant();

  // Payment methods from API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  // Form state
  const [billing, setBilling] = useState<BillingForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
  });
  const [selectedPayment, setSelectedPayment] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessData | null>(null);

  // ─── Fetch payment methods ───────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function fetchMethods() {
      try {
        const res = await fetch('/api/checkout/wc/');
        if (!res.ok) throw new Error('Failed to load payment methods');
        const data = await res.json();
        if (!cancelled) {
          setPaymentMethods(data.methods || []);
          if (data.methods?.length > 0) {
            setSelectedPayment(data.methods[0].id);
          }
        }
      } catch {
        if (!cancelled) {
          setSubmitError('Unable to load payment options. Please refresh.');
        }
      } finally {
        if (!cancelled) setLoadingMethods(false);
      }
    }

    fetchMethods();
    return () => { cancelled = true; };
  }, []);

  // ─── Calculations ───────────────────────────────────────────

  const subtotal = total;
  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : FLAT_RATE_SHIPPING;
  const taxableAmount = subtotal + shipping;
  const hst = useMemo(() => +(taxableAmount * HST_RATE).toFixed(2), [taxableAmount]);
  const grandTotal = useMemo(() => +(subtotal + shipping + hst).toFixed(2), [subtotal, shipping, hst]);

  // ─── Field change handler ───────────────────────────────────

  const handleFieldChange = useCallback((field: keyof BillingForm, value: string) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // ─── Submit order ───────────────────────────────────────────

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Validate billing
    const errors = validateBilling(billing);
    if (!selectedPayment) {
      errors.payment = 'Please select a payment method';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        items: items.map((item) => ({
          productId: Number(item.id),
          quantity: item.quantity,
          name: item.name,
        })),
        billing: {
          first_name: billing.first_name.trim(),
          last_name: billing.last_name.trim(),
          email: billing.email.trim().toLowerCase(),
          phone: billing.phone.trim() || undefined,
          address_1: billing.address_1.trim(),
          address_2: billing.address_2.trim() || undefined,
          city: billing.city.trim(),
          state: billing.state,
          postcode: billing.postcode.trim().toUpperCase().replace(/\s/g, ''),
          country: 'CA',
        },
        payment_method: selectedPayment,
      };

      const res = await fetch('/api/checkout/wc/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Order creation failed. Please try again.');
      }

      if (!data.success) {
        throw new Error(data.error || 'Unexpected error');
      }

      // e-Transfer: show instructions
      if (selectedPayment === 'digipay_etransfer_manual') {
        setOrderSuccess({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          total: data.total,
          etransfer: data.etransfer,
        });
        clearCart();
        return;
      }

      // CC or Crypto: redirect to WC pay page
      if (data.payUrl) {
        clearCart();
        window.location.href = data.payUrl;
        return;
      }

      // Fallback: show success
      setOrderSuccess({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        total: data.total,
      });
      clearCart();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [billing, selectedPayment, items, clearCart]);

  // ─── e-Transfer Success Panel ───────────────────────────────

  if (orderSuccess?.etransfer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center space-y-6">
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--tenant-primary, #2D5016)', opacity: 0.1 }}
          >
            <svg className="w-8 h-8" style={{ color: 'var(--tenant-primary, #2D5016)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Order Placed Successfully
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Order #{orderSuccess.etransfer.orderReference}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 text-left space-y-3">
            <h2 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Interac e-Transfer Instructions
            </h2>
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              {orderSuccess.etransfer.instructions}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reference Number</p>
              <p className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {orderSuccess.etransfer.orderReference}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount Due</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                ${orderSuccess.total} CAD
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Your order is on hold until we receive your e-Transfer. You will receive a confirmation email once payment is verified.
          </p>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--tenant-primary, #2D5016)' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── Redirect Success (non-etransfer, no payUrl fallback) ───

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center space-y-5">
          <svg className="w-12 h-12 mx-auto" style={{ color: 'var(--tenant-primary, #2D5016)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order Created</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Order #{orderSuccess.orderNumber} - ${orderSuccess.total} CAD
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--tenant-primary, #2D5016)' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── Empty Cart ─────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Cart is Empty</h1>
          <p className="text-gray-500 dark:text-gray-400">Browse our collection to find your perfect product.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--tenant-primary, #2D5016)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── Checkout Form ──────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Shop
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Checkout
          {tenant.name !== 'Mohawk Medibles' && (
            <span className="text-lg font-normal text-gray-400 ml-3">via {tenant.name}</span>
          )}
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* ── Left Column: Billing + Payment ────────────── */}
            <div className="lg:col-span-3 space-y-8">

              {/* Billing Information */}
              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: 'var(--tenant-primary, #2D5016)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Billing Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      autoComplete="given-name"
                      value={billing.first_name}
                      onChange={(e) => handleFieldChange('first_name', e.target.value)}
                      data-error={!!fieldErrors.first_name}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 ${
                        fieldErrors.first_name
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-[var(--tenant-primary,#2D5016)]/30 focus:border-[var(--tenant-primary,#2D5016)]'
                      }`}
                    />
                    {fieldErrors.first_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      autoComplete="family-name"
                      value={billing.last_name}
                      onChange={(e) => handleFieldChange('last_name', e.target.value)}
                      data-error={!!fieldErrors.last_name}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 ${
                        fieldErrors.last_name
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-[var(--tenant-primary,#2D5016)]/30 focus:border-[var(--tenant-primary,#2D5016)]'
                      }`}
                    />
                    {fieldErrors.last_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={billing.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      data-error={!!fieldErrors.email}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 ${
                        fieldErrors.email
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-[var(--tenant-primary,#2D5016)]/30 focus:border-[var(--tenant-primary,#2D5016)]'
                      }`}
                    />
                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={billing.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--tenant-primary,#2D5016)]/30 focus:border-[var(--tenant-primary,#2D5016)]"
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2">
                    <label htmlFor="address_1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address_1"
                      type="text"
                      autoComplete="address-line1"
                      value={billing.address_1}
                      onChange={(e) => handleFieldChange('address_1', e.target.value)}
                      data-error={!!fieldErrors.address_1}
                      placeholder="Street address"
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 ${
                        fieldErrors.address_1
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-[var(--tenant-primary,#2D5016)]/30 focus:border-[var(--tenant-primary,#2D5016)]'
                      }`}
                    />
                    {fieldErrors.address_1 && <p className="text-xs text-red-500 mt-1">{fieldErrors.address_1}</p>}
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label htmlFor="address_2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Apartment, suite, etc.
                    </label>
                    <input
                      id="address_2"
                      type="text"
                      autoComplete="address-line2"
                      value={billing.address_2}
                      onChange={(e) => handleFieldChange('address_2', e.target.value)}
                      placeholder="Apt, suite, unit (optional)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--tenant-primary,#2D5016)]/30 focus:border-[var(--tenant-primary,#2D5016)]"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      autoComplete="address-level2"
                      value={billing.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      data-error={!!fieldErrors.city}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 ${
                        fieldErrors.city
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-[var(--tenant-primary,#2D5016)]/30 focus:border-[var(--tenant-primary,#2D5016)]'
                      }`}
                    />
                    {fieldErrors.city && <p className="text-xs text-red-500 mt-1">{fieldErrors.city}</p>}
                  </div>

                  {/* Province */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="state"
                      autoComplete="address-level1"
                      value={billing.state}
                      onChange={(e) => handleFieldChange('state', e.target.value)}
                      data-error={!!fieldErrors.state}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 ${
                        fieldErrors.state
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-[var(--tenant-primary,#2D5016)]/30 focus:border-[var(--tenant-primary,#2D5016)]'
                      }`}
                    >
                      <option value="">Select province...</option>
                      {CANADIAN_PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                    {fieldErrors.state && <p className="text-xs text-red-500 mt-1">{fieldErrors.state}</p>}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="postcode"
                      type="text"
                      autoComplete="postal-code"
                      value={billing.postcode}
                      onChange={(e) => handleFieldChange('postcode', e.target.value.toUpperCase())}
                      data-error={!!fieldErrors.postcode}
                      placeholder="K1A 0B1"
                      maxLength={7}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 uppercase ${
                        fieldErrors.postcode
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-[var(--tenant-primary,#2D5016)]/30 focus:border-[var(--tenant-primary,#2D5016)]'
                      }`}
                    />
                    {fieldErrors.postcode && <p className="text-xs text-red-500 mt-1">{fieldErrors.postcode}</p>}
                  </div>
                </div>
              </section>

              {/* Payment Method Selection */}
              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: 'var(--tenant-primary, #2D5016)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  Payment Method
                </h2>

                {loadingMethods ? (
                  <div className="flex items-center gap-3 text-gray-400 py-4">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading payment options...
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <p className="text-sm text-red-500">No payment methods available. Please try again later.</p>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? 'border-[var(--tenant-primary,#2D5016)] bg-[var(--tenant-primary,#2D5016)]/5'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="mt-1 accent-[var(--tenant-primary,#2D5016)]"
                        />
                        <div className="flex-shrink-0 mt-0.5" style={{ color: selectedPayment === method.id ? 'var(--tenant-primary, #2D5016)' : undefined }}>
                          <PaymentIcon icon={method.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{method.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {fieldErrors.payment && <p className="text-xs text-red-500 mt-2">{fieldErrors.payment}</p>}
              </section>

              {/* Age Verification */}
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400">
                By placing this order, you confirm you are <strong>19 years of age or older</strong> as required by Ontario law.
              </div>
            </div>

            {/* ── Right Column: Order Summary ──────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Order Summary
                </h2>

                {/* Line Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Shipping (Xpresspost)</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600 dark:text-green-400">FREE</span>
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">${shipping.toFixed(2)}</span>
                      )}
                    </span>
                  </div>

                  {subtotal < FREE_SHIPPING_MIN && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                      Add ${(FREE_SHIPPING_MIN - subtotal).toFixed(2)} more for FREE shipping!
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tax (Tax-Free)</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">$0.00</span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-lg font-bold" style={{ color: 'var(--tenant-primary, #2D5016)' }}>
                      ${grandTotal.toFixed(2)} CAD
                    </span>
                  </div>
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    {submitError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || loadingMethods || paymentMethods.length === 0}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--tenant-primary, #2D5016)' }}
                >
                  {submitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Place Order - ${grandTotal.toFixed(2)} CAD
                    </>
                  )}
                </button>

                {/* Trust Signals */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <svg className="w-3.5 h-3.5" style={{ color: 'var(--tenant-primary, #2D5016)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Secure checkout
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <svg className="w-3.5 h-3.5" style={{ color: 'var(--tenant-primary, #2D5016)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    Discreet Canada Post Xpresspost
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
