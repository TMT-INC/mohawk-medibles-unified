import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca";
const INDEXING_API_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const DAILY_QUOTA = 190;

function base64url(input: string | ArrayBuffer): string {
  let b64: string;
  if (typeof input === "string") {
    b64 = btoa(input);
  } else {
    b64 = btoa(String.fromCharCode(...new Uint8Array(input)));
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  const headerB64 = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claimB64 = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));
  const signingInput = `${headerB64}.${claimB64}`;
  const pemContents = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/g, "").replace(/-----END PRIVATE KEY-----/g, "").replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey("pkcs8", binaryKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${base64url(signature)}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!tokenRes.ok) throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/sitemap.xml`, { headers: { "User-Agent": "MohawkMedibles-GSC-Ping/1.0" } });
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  const urls: string[] = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xml)) !== null) urls.push(match[1]);
  return urls;
}

let lastPingedUrls: Set<string> = new Set();
let lastPingedDate = "";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    return NextResponse.json({ error: "GOOGLE_SERVICE_ACCOUNT_JSON not configured" }, { status: 500 });
  }
  const today = new Date().toISOString().split("T")[0];
  const results = { date: today, totalSitemapUrls: 0, newUrls: 0, submitted: 0, failed: 0, skipped: 0, errors: [] as string[] };
  try {
    const sitemapUrls = await fetchSitemapUrls();
    results.totalSitemapUrls = sitemapUrls.length;
    if (lastPingedDate !== today) { lastPingedUrls = new Set(); lastPingedDate = today; }
    const newUrls = sitemapUrls.filter((url) => !lastPingedUrls.has(url));
    results.newUrls = newUrls.length;
    if (newUrls.length === 0) return NextResponse.json({ ...results, message: "All sitemap URLs already pinged today" });
    const accessToken = await getAccessToken(serviceAccountJson);
    const toSubmit = newUrls.slice(0, DAILY_QUOTA);
    results.skipped = Math.max(0, newUrls.length - DAILY_QUOTA);
    for (const url of toSubmit) {
      try {
        const res = await fetch(INDEXING_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ url, type: "URL_UPDATED" }),
        });
        if (res.ok) { results.submitted++; lastPingedUrls.add(url); }
        else { results.failed++; results.errors.push(`${url}: ${res.status}`); }
      } catch (err) { results.failed++; results.errors.push(`${url}: ${err instanceof Error ? err.message : "Unknown"}`); }
    }
    return NextResponse.json({ ...results, message: `Submitted ${results.submitted}/${toSubmit.length} URLs` });
  } catch (err) {
    return NextResponse.json({ ...results, error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
