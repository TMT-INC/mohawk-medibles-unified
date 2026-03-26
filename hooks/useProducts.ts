"use client";
import { useState, useEffect } from "react";

export interface ProductLite {
  id: number;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  price: number;
  image: string;
  altText: string;
  featured: boolean;
  specs: {
    thc: string;
    cbd: string;
    type: string;
    weight: string;
    terpenes: string[];
  } | null;
  effects: string[];
  shortDescription: string;
}

// In-memory cache keyed by query string
const cache: Record<string, ProductLite[]> = {};

export function useProducts(params?: {
  category?: string;
  limit?: number;
  featured?: boolean;
  slugs?: string[];
}) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.featured) qs.set("featured", "true");
  if (params?.slugs?.length) qs.set("slugs", params.slugs.join(","));
  const key = qs.toString();

  const [products, setProducts] = useState<ProductLite[]>(cache[key] || []);
  const [loading, setLoading] = useState(!cache[key]);

  useEffect(() => {
    if (cache[key]) {
      setProducts(cache[key]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/products?${key}`)
      .then((r) => r.json())
      .then((data: ProductLite[]) => {
        if (cancelled) return;
        cache[key] = data;
        setProducts(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { products, loading };
}
