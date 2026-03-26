// ─── Canadian Postal Code Lookup Utility ──────────────────────────────
// Maps Forward Sortation Areas (FSA = first 3 chars of postal code) to provinces,
// regions, and delivery estimates. Canada Post uses FSA prefixes to route mail.

export interface PostalLookupResult {
  valid: boolean;
  postalCode: string;
  fsa: string;
  province: {
    abbreviation: string;
    name: { en: string; fr: string };
    slug: string;
  };
  region: {
    name: { en: string; fr: string };
    deliveryDays: { min: number; max: number };
    carrier: string;
  };
  shipping: {
    flatRate: number;
    freeThreshold: number;
    isFree: boolean;
  };
  nearestCity: {
    name: { en: string; fr: string };
    slug: string;
    provinceSlug: string;
  } | null;
}

// ─── FSA First Letter → Province Mapping ──────────────────────────────
// Based on Canada Post's official FSA allocation
const FSA_PROVINCE_MAP: Record<string, { abbr: string; slug: string; name: { en: string; fr: string } }> = {
  A: { abbr: "NL", slug: "newfoundland-labrador", name: { en: "Newfoundland & Labrador", fr: "Terre-Neuve-et-Labrador" } },
  B: { abbr: "NS", slug: "nova-scotia", name: { en: "Nova Scotia", fr: "Nouvelle-Écosse" } },
  C: { abbr: "PE", slug: "prince-edward-island", name: { en: "Prince Edward Island", fr: "Île-du-Prince-Édouard" } },
  E: { abbr: "NB", slug: "new-brunswick", name: { en: "New Brunswick", fr: "Nouveau-Brunswick" } },
  G: { abbr: "QC", slug: "quebec", name: { en: "Quebec", fr: "Québec" } },
  H: { abbr: "QC", slug: "quebec", name: { en: "Quebec", fr: "Québec" } },
  J: { abbr: "QC", slug: "quebec", name: { en: "Quebec", fr: "Québec" } },
  K: { abbr: "ON", slug: "ontario", name: { en: "Ontario", fr: "Ontario" } },
  L: { abbr: "ON", slug: "ontario", name: { en: "Ontario", fr: "Ontario" } },
  M: { abbr: "ON", slug: "ontario", name: { en: "Ontario", fr: "Ontario" } },
  N: { abbr: "ON", slug: "ontario", name: { en: "Ontario", fr: "Ontario" } },
  P: { abbr: "ON", slug: "ontario", name: { en: "Ontario", fr: "Ontario" } },
  R: { abbr: "MB", slug: "manitoba", name: { en: "Manitoba", fr: "Manitoba" } },
  S: { abbr: "SK", slug: "saskatchewan", name: { en: "Saskatchewan", fr: "Saskatchewan" } },
  T: { abbr: "AB", slug: "alberta", name: { en: "Alberta", fr: "Alberta" } },
  V: { abbr: "BC", slug: "british-columbia", name: { en: "British Columbia", fr: "Colombie-Britannique" } },
  X: { abbr: "NT", slug: "northwest-territories", name: { en: "Northwest Territories", fr: "Territoires du Nord-Ouest" } },
  Y: { abbr: "YT", slug: "yukon", name: { en: "Yukon", fr: "Yukon" } },
};

// X0 prefix is split between NT and NU
const X_NUNAVUT_FSAS = ["X0A", "X0B", "X0C", "X0E", "X0G"];

// ─── Delivery Regions ──────────────────────────────────────────────
interface DeliveryRegion {
  name: { en: string; fr: string };
  deliveryDays: { min: number; max: number };
  carrier: string;
  provinces: string[];
}

const DELIVERY_REGIONS: DeliveryRegion[] = [
  {
    name: { en: "Ontario (Local)", fr: "Ontario (Local)" },
    deliveryDays: { min: 1, max: 2 },
    carrier: "Canada Post Xpresspost / Purolator Express",
    provinces: ["ON"],
  },
  {
    name: { en: "Quebec & Maritimes", fr: "Québec et Maritimes" },
    deliveryDays: { min: 2, max: 3 },
    carrier: "Canada Post Xpresspost / Purolator",
    provinces: ["QC", "NB", "NS", "PE", "NL"],
  },
  {
    name: { en: "Western Canada", fr: "Ouest canadien" },
    deliveryDays: { min: 3, max: 5 },
    carrier: "Canada Post Xpresspost / Purolator",
    provinces: ["MB", "SK", "AB", "BC"],
  },
  {
    name: { en: "Northern Territories", fr: "Territoires du Nord" },
    deliveryDays: { min: 5, max: 7 },
    carrier: "Canada Post Priority / Purolator Express",
    provinces: ["YT", "NT", "NU"],
  },
];

// ─── FSA → City Mapping (major FSA prefixes) ──────────────────────────
// Maps common FSA codes to the nearest city in our locations database
const FSA_CITY_MAP: Record<string, { name: { en: string; fr: string }; slug: string; provinceSlug: string }> = {
  // Ontario
  M: { name: { en: "Toronto", fr: "Toronto" }, slug: "toronto", provinceSlug: "ontario" },
  K1: { name: { en: "Ottawa", fr: "Ottawa" }, slug: "ottawa", provinceSlug: "ontario" },
  K2: { name: { en: "Ottawa", fr: "Ottawa" }, slug: "ottawa", provinceSlug: "ontario" },
  L5: { name: { en: "Mississauga", fr: "Mississauga" }, slug: "mississauga", provinceSlug: "ontario" },
  L8: { name: { en: "Hamilton", fr: "Hamilton" }, slug: "hamilton", provinceSlug: "ontario" },
  L6: { name: { en: "Brampton", fr: "Brampton" }, slug: "brampton", provinceSlug: "ontario" },
  N6: { name: { en: "London", fr: "London" }, slug: "london", provinceSlug: "ontario" },
  K7: { name: { en: "Kingston", fr: "Kingston" }, slug: "kingston", provinceSlug: "ontario" },
  N2: { name: { en: "Kitchener", fr: "Kitchener" }, slug: "kitchener", provinceSlug: "ontario" },
  L2: { name: { en: "Niagara Falls", fr: "Chutes Niagara" }, slug: "niagara-falls", provinceSlug: "ontario" },
  P3: { name: { en: "Sudbury", fr: "Sudbury" }, slug: "sudbury", provinceSlug: "ontario" },
  P7: { name: { en: "Thunder Bay", fr: "Thunder Bay" }, slug: "thunder-bay", provinceSlug: "ontario" },
  N1: { name: { en: "Guelph", fr: "Guelph" }, slug: "guelph", provinceSlug: "ontario" },
  L3: { name: { en: "St. Catharines", fr: "St. Catharines" }, slug: "st-catharines", provinceSlug: "ontario" },
  L9: { name: { en: "Barrie", fr: "Barrie" }, slug: "barrie", provinceSlug: "ontario" },
  L1: { name: { en: "Oshawa", fr: "Oshawa" }, slug: "oshawa", provinceSlug: "ontario" },
  N5: { name: { en: "Woodstock", fr: "Woodstock" }, slug: "woodstock", provinceSlug: "ontario" },
  // Quebec
  H: { name: { en: "Montreal", fr: "Montréal" }, slug: "montreal", provinceSlug: "quebec" },
  G1: { name: { en: "Quebec City", fr: "Ville de Québec" }, slug: "quebec-city", provinceSlug: "quebec" },
  J1: { name: { en: "Sherbrooke", fr: "Sherbrooke" }, slug: "sherbrooke", provinceSlug: "quebec" },
  G7: { name: { en: "Saguenay", fr: "Saguenay" }, slug: "saguenay", provinceSlug: "quebec" },
  J4: { name: { en: "Longueuil", fr: "Longueuil" }, slug: "longueuil", provinceSlug: "quebec" },
  J7: { name: { en: "Laval", fr: "Laval" }, slug: "laval", provinceSlug: "quebec" },
  G9: { name: { en: "Trois-Rivières", fr: "Trois-Rivières" }, slug: "trois-rivieres", provinceSlug: "quebec" },
  J8: { name: { en: "Gatineau", fr: "Gatineau" }, slug: "gatineau", provinceSlug: "quebec" },
  // British Columbia
  V6: { name: { en: "Vancouver", fr: "Vancouver" }, slug: "vancouver", provinceSlug: "british-columbia" },
  V8: { name: { en: "Victoria", fr: "Victoria" }, slug: "victoria", provinceSlug: "british-columbia" },
  V1: { name: { en: "Kelowna", fr: "Kelowna" }, slug: "kelowna", provinceSlug: "british-columbia" },
  V2: { name: { en: "Surrey", fr: "Surrey" }, slug: "surrey", provinceSlug: "british-columbia" },
  V3: { name: { en: "Burnaby", fr: "Burnaby" }, slug: "burnaby", provinceSlug: "british-columbia" },
  V5: { name: { en: "Richmond", fr: "Richmond" }, slug: "richmond", provinceSlug: "british-columbia" },
  // Alberta
  T2: { name: { en: "Calgary", fr: "Calgary" }, slug: "calgary", provinceSlug: "alberta" },
  T5: { name: { en: "Edmonton", fr: "Edmonton" }, slug: "edmonton", provinceSlug: "alberta" },
  T6: { name: { en: "Edmonton", fr: "Edmonton" }, slug: "edmonton", provinceSlug: "alberta" },
  T1: { name: { en: "Lethbridge", fr: "Lethbridge" }, slug: "lethbridge", provinceSlug: "alberta" },
  T4: { name: { en: "Red Deer", fr: "Red Deer" }, slug: "red-deer", provinceSlug: "alberta" },
  // Manitoba
  R3: { name: { en: "Winnipeg", fr: "Winnipeg" }, slug: "winnipeg", provinceSlug: "manitoba" },
  R2: { name: { en: "Winnipeg", fr: "Winnipeg" }, slug: "winnipeg", provinceSlug: "manitoba" },
  R7: { name: { en: "Brandon", fr: "Brandon" }, slug: "brandon", provinceSlug: "manitoba" },
  // Saskatchewan
  S7: { name: { en: "Saskatoon", fr: "Saskatoon" }, slug: "saskatoon", provinceSlug: "saskatchewan" },
  S4: { name: { en: "Regina", fr: "Regina" }, slug: "regina", provinceSlug: "saskatchewan" },
  // Nova Scotia
  B3: { name: { en: "Halifax", fr: "Halifax" }, slug: "halifax", provinceSlug: "nova-scotia" },
  // New Brunswick
  E1: { name: { en: "Moncton", fr: "Moncton" }, slug: "moncton", provinceSlug: "new-brunswick" },
  E2: { name: { en: "Fredericton", fr: "Fredericton" }, slug: "fredericton", provinceSlug: "new-brunswick" },
  E3: { name: { en: "Saint John", fr: "Saint John" }, slug: "saint-john", provinceSlug: "new-brunswick" },
  // Newfoundland
  A1: { name: { en: "St. John's", fr: "St. John's" }, slug: "st-johns", provinceSlug: "newfoundland-labrador" },
  // PEI
  C1: { name: { en: "Charlottetown", fr: "Charlottetown" }, slug: "charlottetown", provinceSlug: "prince-edward-island" },
  // Northern
  Y1: { name: { en: "Whitehorse", fr: "Whitehorse" }, slug: "whitehorse", provinceSlug: "yukon" },
  X1: { name: { en: "Yellowknife", fr: "Yellowknife" }, slug: "yellowknife", provinceSlug: "northwest-territories" },
  X0A: { name: { en: "Iqaluit", fr: "Iqaluit" }, slug: "iqaluit", provinceSlug: "nunavut" },
};

// Province capital fallbacks for when no FSA-specific city match is found
const PROVINCE_CAPITAL_MAP: Record<string, { name: { en: string; fr: string }; slug: string; provinceSlug: string }> = {
  ON: { name: { en: "Toronto", fr: "Toronto" }, slug: "toronto", provinceSlug: "ontario" },
  QC: { name: { en: "Montreal", fr: "Montréal" }, slug: "montreal", provinceSlug: "quebec" },
  BC: { name: { en: "Vancouver", fr: "Vancouver" }, slug: "vancouver", provinceSlug: "british-columbia" },
  AB: { name: { en: "Calgary", fr: "Calgary" }, slug: "calgary", provinceSlug: "alberta" },
  MB: { name: { en: "Winnipeg", fr: "Winnipeg" }, slug: "winnipeg", provinceSlug: "manitoba" },
  SK: { name: { en: "Saskatoon", fr: "Saskatoon" }, slug: "saskatoon", provinceSlug: "saskatchewan" },
  NS: { name: { en: "Halifax", fr: "Halifax" }, slug: "halifax", provinceSlug: "nova-scotia" },
  NB: { name: { en: "Moncton", fr: "Moncton" }, slug: "moncton", provinceSlug: "new-brunswick" },
  NL: { name: { en: "St. John's", fr: "St. John's" }, slug: "st-johns", provinceSlug: "newfoundland-labrador" },
  PE: { name: { en: "Charlottetown", fr: "Charlottetown" }, slug: "charlottetown", provinceSlug: "prince-edward-island" },
  YT: { name: { en: "Whitehorse", fr: "Whitehorse" }, slug: "whitehorse", provinceSlug: "yukon" },
  NT: { name: { en: "Yellowknife", fr: "Yellowknife" }, slug: "yellowknife", provinceSlug: "northwest-territories" },
  NU: { name: { en: "Iqaluit", fr: "Iqaluit" }, slug: "iqaluit", provinceSlug: "nunavut" },
};

// ─── Validation ──────────────────────────────────────────────
const POSTAL_CODE_REGEX = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\s?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

export function isValidCanadianPostalCode(postalCode: string): boolean {
  return POSTAL_CODE_REGEX.test(postalCode.trim());
}

export function normalizePostalCode(postalCode: string): string {
  const cleaned = postalCode.trim().toUpperCase().replace(/\s+/g, "");
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return cleaned;
}

// ─── Main Lookup Function ──────────────────────────────────────────────
export function lookupPostalCode(postalCode: string, cartSubtotal?: number): PostalLookupResult | { valid: false; error: { en: string; fr: string } } {
  const normalized = normalizePostalCode(postalCode);

  if (!isValidCanadianPostalCode(normalized)) {
    return {
      valid: false,
      error: {
        en: "Please enter a valid Canadian postal code (e.g., M5V 1A1)",
        fr: "Veuillez entrer un code postal canadien valide (ex. : M5V 1A1)",
      },
    };
  }

  const fsa = normalized.slice(0, 3).toUpperCase();
  const firstLetter = fsa[0];

  // Determine province
  let provinceInfo = FSA_PROVINCE_MAP[firstLetter];
  if (!provinceInfo) {
    return {
      valid: false,
      error: {
        en: "This postal code does not appear to be a valid Canadian postal code.",
        fr: "Ce code postal ne semble pas être un code postal canadien valide.",
      },
    };
  }

  // Handle Nunavut (X0A, X0B, X0C, X0E, X0G)
  if (firstLetter === "X" && X_NUNAVUT_FSAS.includes(fsa)) {
    provinceInfo = { abbr: "NU", slug: "nunavut", name: { en: "Nunavut", fr: "Nunavut" } };
  }

  // Find delivery region
  const region = DELIVERY_REGIONS.find((r) => r.provinces.includes(provinceInfo.abbr)) || DELIVERY_REGIONS[3]; // Default to Northern

  // Calculate shipping
  const subtotal = cartSubtotal ?? 0;
  const freeThreshold = 149;
  const flatRate = 15;
  const isFree = subtotal >= freeThreshold;

  // Find nearest city - try FSA (3-char), then FSA (2-char), then province capital
  const nearestCity = FSA_CITY_MAP[fsa] || FSA_CITY_MAP[fsa.slice(0, 2)] || FSA_CITY_MAP[firstLetter] || PROVINCE_CAPITAL_MAP[provinceInfo.abbr] || null;

  return {
    valid: true,
    postalCode: normalized,
    fsa,
    province: {
      abbreviation: provinceInfo.abbr,
      name: provinceInfo.name,
      slug: provinceInfo.slug,
    },
    region: {
      name: region.name,
      deliveryDays: region.deliveryDays,
      carrier: region.carrier,
    },
    shipping: {
      flatRate,
      freeThreshold,
      isFree,
    },
    nearestCity,
  };
}
