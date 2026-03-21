/**
 * /cannabis-laws/[province] — Dynamic Province Cannabis Law Guide
 * =============================================================================
 * Detailed cannabis law breakdown for each of Canada's 13 provinces and
 * territories. Covers legal age, possession limits, consumption rules, home
 * growing, delivery laws, and driving regulations.
 *
 * SEO Target: "cannabis laws [province]", "weed laws [province]"
 * Combined search volume target: 35K/mo across all province pages
 *
 * Server Component (RSC) — params are Promises in Next.js 16
 *
 * All data in PROVINCE_LAWS is static hardcoded content — safe for JSON-LD
 * injection via dangerouslySetInnerHTML. No user input is rendered.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";

// ─── Province Law Data ───────────────────────────────────────────────

interface ProvinceFAQ {
  q: string;
  a: string;
}

interface ProvinceLaw {
  slug: string;
  name: string;
  abbreviation: string;
  legalAge: number;
  possessionLimit: string;
  purchaseLimit: string;
  retailModel: string;
  consumptionRules: string;
  deliveryLaws: string;
  growingRules: string;
  drivingRules: string;
  keyFact: string;
  faqs: ProvinceFAQ[];
}

const PROVINCE_LAWS: Record<string, ProvinceLaw> = {
  ontario: {
    slug: "ontario",
    name: "Ontario",
    abbreviation: "ON",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Private retail (licensed by AGCO) + Ontario Cannabis Store (OCS) online",
    consumptionRules:
      "Private residences, many outdoor public spaces where tobacco smoking is allowed. Not in enclosed public spaces, vehicles (even as passenger), workplaces, schools, playgrounds, hospitals, or near children's play areas.",
    deliveryLaws:
      "Legal via licensed private retailers and OCS online. Must verify age (19+) at point of delivery. Same-day delivery available in select urban areas through licensed retailers.",
    growingRules:
      "Up to 4 plants per household for personal use. Plants must be grown from legally obtained seeds or seedlings from OCS or a licensed retailer. Landlords and condo boards may restrict growing in rental units.",
    drivingRules:
      "Zero tolerance for novice drivers (G1, G2, M1, M2) and drivers under 21. For fully licensed drivers: 2-5 ng/mL THC results in 3-day licence suspension and $250 fine; 5+ ng/mL THC is a criminal offence. Open cannabis in a vehicle is prohibited.",
    keyFact:
      "Largest cannabis market in Canada with 1,500+ retail stores.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in Ontario?",
        a: "You must be 19 years or older to buy, possess, consume, or grow recreational cannabis in Ontario. This applies to all forms including dried flower, edibles, concentrates, and topicals. Valid government-issued photo ID is required for all purchases.",
      },
      {
        q: "Where can I legally smoke cannabis in Ontario?",
        a: "Ontario allows cannabis consumption in most places where tobacco smoking is permitted, including private residences, many outdoor public areas, sidewalks, and parks. It is banned in enclosed public spaces, workplaces, vehicles, restaurant patios, playgrounds, sports fields, and within 20 metres of schools or children's play areas.",
      },
      {
        q: "Can I grow cannabis at home in Ontario?",
        a: "Yes. Ontario allows up to 4 cannabis plants per household for personal use. Plants must come from legally obtained seeds or seedlings. Growing is permitted in houses, townhouses, and apartments, but landlords and condo corporations may impose restrictions. Plants cannot be visible from public spaces.",
      },
      {
        q: "How does cannabis delivery work in Ontario?",
        a: "Cannabis can be legally delivered in Ontario through the Ontario Cannabis Store (OCS) online platform or through licensed private retailers that offer delivery services. All deliveries require age verification (19+) at the door with valid government ID. OCS ships via Canada Post, while private retailers may offer same-day delivery in certain areas.",
      },
      {
        q: "What are the penalties for driving high in Ontario?",
        a: "Ontario has strict impaired driving laws for cannabis. Novice drivers (G1/G2) and drivers under 21 face zero tolerance with immediate licence suspension. Fully licensed drivers with 2-5 ng/mL THC blood level face a 3-day suspension and $250 fine. At 5+ ng/mL, it becomes a criminal offence with potential jail time, heavy fines, and licence suspension of at least 1 year.",
      },
    ],
  },
  "british-columbia": {
    slug: "british-columbia",
    name: "British Columbia",
    abbreviation: "BC",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Government-run BC Cannabis Stores + licensed private retailers. Online sales through bccannabisstores.com.",
    consumptionRules:
      "Permitted in private residences, many public outdoor spaces where tobacco is allowed, and some designated smoking areas. Banned in vehicles, on school grounds, in skate parks, playgrounds, sports fields, and anywhere smoking or vaping is prohibited.",
    deliveryLaws:
      "Legal via BC Cannabis Stores online and licensed private retailers. Age verification (19+) required at delivery. Provincial mail order through BC Cannabis Stores ships across BC.",
    growingRules:
      "Up to 4 plants per household for personal use. Plants must not be visible from public spaces. Some strata councils and landlords may restrict growing. Plants must come from legal seeds or seedlings.",
    drivingRules:
      "Zero tolerance for new drivers in the Graduated Licensing Program. Immediate 90-day driving prohibition for THC-positive drivers. Criminal charges apply at 2+ ng/mL THC. Having open cannabis in a vehicle is an offence.",
    keyFact:
      "Pioneered cannabis culture in Canada; home to the famous BC Bud.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in British Columbia?",
        a: "You must be 19 years or older to purchase, possess, or consume cannabis in British Columbia. This age requirement applies to all cannabis products and purchase methods, including in-store, online, and delivery orders.",
      },
      {
        q: "Can I smoke cannabis in public in British Columbia?",
        a: "BC allows cannabis smoking and vaping in many outdoor public areas where tobacco smoking is permitted. However, it is prohibited in vehicles, on school properties, in playgrounds, skate parks, sports fields, bus stops, and anywhere local bylaws restrict smoking. Individual municipalities may have additional restrictions.",
      },
      {
        q: "Where can I buy legal cannabis in BC?",
        a: "Cannabis can be purchased at government-run BC Cannabis Stores, licensed private retail stores throughout the province, and online at bccannabisstores.com. BC has a mixed public-private retail model with hundreds of licensed locations across the province.",
      },
      {
        q: "Can I grow cannabis plants at home in BC?",
        a: "Yes, adults 19+ can grow up to 4 cannabis plants per household in BC. Plants must not be visible from any public space. Growing is allowed in houses, apartments, and townhomes, though strata councils and landlords may impose restrictions in their properties.",
      },
      {
        q: "What happens if I drive under the influence of cannabis in BC?",
        a: "BC has zero tolerance for cannabis-impaired driving for new drivers. Any driver who tests positive for THC faces an immediate 90-day driving prohibition. Federal criminal charges apply at 2-5 ng/mL THC (summary offence) and 5+ ng/mL (indictable offence). Penalties include fines, licence suspension, vehicle impoundment, and potential imprisonment.",
      },
    ],
  },
  alberta: {
    slug: "alberta",
    name: "Alberta",
    abbreviation: "AB",
    legalAge: 18,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Fully private retail model licensed by AGLC (Alberta Gaming, Liquor and Cannabis). Over 700 licensed stores. Online sales through albertacannabis.org.",
    consumptionRules:
      "Permitted in private residences and on some public property where smoking tobacco is allowed, subject to municipal bylaws. Banned in vehicles, hospitals, schools, playgrounds, and any indoor public or workplaces. Calgary and Edmonton have additional restrictions.",
    deliveryLaws:
      "Legal via licensed retailers offering delivery and through albertacannabis.org online store. Age verification (18+) required. Licensed retailers may offer same-day delivery in urban areas.",
    growingRules:
      "Up to 4 plants per household for personal use from legally obtained seeds. Plants cannot be visible from public areas. Landlords, condo boards, and municipalities may impose additional growing restrictions.",
    drivingRules:
      "Zero tolerance for drivers in the Graduated Driver Licensing (GDL) program. Immediate roadside sanctions include 90-day licence suspension and 30-day vehicle seizure for drug-impaired driving. Federal criminal thresholds apply (2-5 ng/mL and 5+ ng/mL THC).",
    keyFact:
      "Lowest legal age (18) among most provinces. Over 700 licensed private retail stores — one of the most open retail markets in Canada.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in Alberta?",
        a: "Alberta's legal age for purchasing cannabis is 18, matching the provincial drinking age and the federal minimum. This is the lowest legal cannabis age in most of Canada (tied with Quebec's former age before it was raised to 21). Valid government ID is required for all purchases.",
      },
      {
        q: "Where can I consume cannabis in Alberta?",
        a: "Cannabis can be consumed in private residences and on some public property where tobacco smoking is permitted. However, rules vary by municipality — Calgary restricts public cannabis use more than Edmonton. It is universally banned in vehicles, workplaces, hospitals, schools, and near playgrounds.",
      },
      {
        q: "How many cannabis stores are there in Alberta?",
        a: "Alberta has over 700 licensed private cannabis retail stores, making it one of the most competitive cannabis retail markets in Canada. The province uses a fully private retail model licensed by AGLC, with no government-run stores. Online purchasing is available through albertacannabis.org.",
      },
      {
        q: "Can I grow cannabis at home in Alberta?",
        a: "Yes, adults 18+ in Alberta can grow up to 4 cannabis plants per household. Plants must be grown from seeds or seedlings obtained from a licensed source. They cannot be visible from public areas. Landlords and condo boards may prohibit growing in rental or strata properties.",
      },
      {
        q: "What are Alberta's cannabis-impaired driving penalties?",
        a: "Alberta enforces zero tolerance for cannabis impairment among GDL drivers. All drivers face immediate roadside sanctions including a 90-day licence suspension and 30-day vehicle seizure if found to be drug-impaired. Federal criminal thresholds (2-5 ng/mL and 5+ ng/mL THC) also apply with potential fines, jail time, and criminal records.",
      },
    ],
  },
  quebec: {
    slug: "quebec",
    name: "Quebec",
    abbreviation: "QC",
    legalAge: 21,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Government monopoly through SQDC (Societe quebecoise du cannabis). No private retailers permitted. Online sales through sqdc.ca.",
    consumptionRules:
      "Restricted to private residences only since 2019 amendments. Banned in all public spaces, parks, sidewalks, restaurant terraces, and any area accessible to the public. Most restrictive consumption rules in Canada.",
    deliveryLaws:
      "Legal only through SQDC online (sqdc.ca). No private delivery services allowed. SQDC ships across Quebec with age verification (21+) at delivery. Canada Post handles fulfillment.",
    growingRules:
      "Home cultivation is completely PROHIBITED in Quebec. This is one of only two provinces (along with Manitoba) that bans home growing, despite the federal Cannabis Act permitting it. Legal challenges are ongoing.",
    drivingRules:
      "Zero tolerance for all drivers — any detectable THC in saliva results in immediate 90-day licence suspension. Criminal charges at federal thresholds (2+ ng/mL). Among the strictest impaired driving laws in Canada for cannabis.",
    keyFact:
      "Highest legal age in Canada at 21. SQDC is the sole legal retailer. Home growing is completely banned.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in Quebec?",
        a: "Quebec has the highest legal cannabis age in Canada at 21. This was raised from 18 in October 2019. You must be 21 or older to purchase, possess, or consume cannabis in Quebec. Valid government-issued photo ID (permis de conduire, carte d'assurance maladie, or passeport) is required.",
      },
      {
        q: "Can I smoke cannabis in public in Quebec?",
        a: "No. Quebec has the most restrictive cannabis consumption rules in Canada. Since 2019, cannabis use is banned in all public places including parks, sidewalks, restaurant terraces, and any area accessible to the public. Consumption is only permitted inside private residences. Even some private spaces like common areas of apartment buildings are off-limits.",
      },
      {
        q: "Where can I buy legal cannabis in Quebec?",
        a: "The only legal option to buy cannabis in Quebec is through SQDC (Societe quebecoise du cannabis) — either at their physical retail locations or online at sqdc.ca. No private cannabis retailers are permitted in Quebec. The SQDC operates as a government monopoly similar to the SAQ for alcohol.",
      },
      {
        q: "Can I grow cannabis at home in Quebec?",
        a: "No. Quebec is one of only two provinces in Canada that completely bans home cultivation of cannabis. Despite the federal Cannabis Act allowing up to 4 plants per household, Quebec's provincial law prohibits all home growing. Legal challenges to this ban have been filed but the prohibition remains in effect as of 2026.",
      },
      {
        q: "What are the penalties for driving after using cannabis in Quebec?",
        a: "Quebec enforces a zero-tolerance policy for cannabis and driving. Any detectable level of THC in your system while driving results in an immediate 90-day licence suspension on the spot. Federal criminal charges apply at 2+ ng/mL THC blood level. Quebec's approach is among the strictest in Canada, applying equally to all drivers regardless of experience level.",
      },
    ],
  },
  manitoba: {
    slug: "manitoba",
    name: "Manitoba",
    abbreviation: "MB",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Fully private retail model licensed by the Liquor, Gaming and Cannabis Authority of Manitoba (LGCA). No government-run stores. Online sales through private licensed retailers.",
    consumptionRules:
      "Private residences only. Manitoba bans cannabis consumption in all public places. It is illegal to smoke or vape cannabis anywhere accessible to the public, including parks, sidewalks, and outdoor patios. Among the most restrictive in Canada alongside Quebec.",
    deliveryLaws:
      "Legal through licensed private retailers that offer delivery services. Age verification (19+) required at delivery. Online ordering available through individual licensed retailers.",
    growingRules:
      "Home cultivation is completely PROHIBITED in Manitoba. Along with Quebec, Manitoba is one of only two provinces that bans home growing entirely, despite the federal law allowing up to 4 plants per household.",
    drivingRules:
      "Zero tolerance for new drivers. Immediate 24-hour licence suspension for any driver suspected of drug impairment. Federal criminal thresholds apply. Manitoba also has Administrative Licence Suspension (ADLS) for drug-impaired driving.",
    keyFact:
      "Private retail model with no home growing allowed. Municipalities can opt out of hosting cannabis stores.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in Manitoba?",
        a: "The legal age to purchase and possess cannabis in Manitoba is 19. This applies to all forms of cannabis including dried flower, edibles, concentrates, and topicals. You must present valid government-issued photo ID for every purchase at a licensed retail store.",
      },
      {
        q: "Can I smoke cannabis in public in Manitoba?",
        a: "No. Manitoba restricts cannabis consumption to private residences only. It is illegal to consume cannabis in any public place including parks, sidewalks, restaurant patios, and outdoor spaces. This makes Manitoba one of the most restrictive provinces for cannabis consumption in Canada.",
      },
      {
        q: "Can I grow cannabis at home in Manitoba?",
        a: "No. Manitoba is one of only two Canadian provinces (along with Quebec) that completely prohibits home cultivation of cannabis. Despite the federal Cannabis Act allowing up to 4 plants per household, Manitoba's provincial legislation overrides this for its residents.",
      },
      {
        q: "How do I order cannabis online in Manitoba?",
        a: "Cannabis can be ordered online through licensed private retailers in Manitoba that offer delivery or shipping services. Manitoba does not have a government-run online store like some other provinces. All online orders require age verification (19+) at the point of delivery.",
      },
      {
        q: "Can municipalities in Manitoba ban cannabis stores?",
        a: "Yes. Manitoba allows individual municipalities to hold votes on whether to permit cannabis retail stores in their jurisdiction. Some smaller communities have opted out, meaning no licensed cannabis retail stores operate in those areas. Residents in those areas can still order online for delivery.",
      },
    ],
  },
  saskatchewan: {
    slug: "saskatchewan",
    name: "Saskatchewan",
    abbreviation: "SK",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Fully private retail model regulated by the Saskatchewan Liquor and Gaming Authority (SLGA). Over 90 licensed cannabis stores. No government-run retail locations.",
    consumptionRules:
      "Private residences and some outdoor areas where tobacco smoking is permitted, subject to municipal bylaws. Banned in vehicles, enclosed public places, workplaces, schools, playgrounds, and hospital grounds. Municipalities can impose stricter rules.",
    deliveryLaws:
      "Legal through licensed retailers. Online sales are available through licensed retail outlets that offer shipping within the province. Age verification (19+) required on all orders.",
    growingRules:
      "Up to 4 plants per household for personal use. Plants must come from legally obtained seeds or seedlings. Standard restrictions on visibility from public spaces apply. Landlords and property managers may impose additional restrictions.",
    drivingRules:
      "Immediate 24-hour vehicle impoundment and licence suspension for suspected drug-impaired driving. Zero tolerance for new drivers. Federal criminal thresholds apply (2-5 ng/mL and 5+ ng/mL THC).",
    keyFact:
      "Fully private retail model with over 90 licensed cannabis stores. Early adopter of private cannabis retail.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in Saskatchewan?",
        a: "You must be 19 years or older to legally purchase, possess, or consume cannabis in Saskatchewan. This age requirement applies at all licensed retail stores and for any online cannabis orders. Government-issued photo ID is required.",
      },
      {
        q: "Where can I consume cannabis in Saskatchewan?",
        a: "Cannabis may be consumed in private residences and in some outdoor public areas where tobacco smoking is permitted. However, municipal bylaws may impose additional restrictions. It is universally prohibited in vehicles, schools, playgrounds, workplaces, and enclosed public spaces.",
      },
      {
        q: "How many cannabis stores are in Saskatchewan?",
        a: "Saskatchewan has over 90 licensed private cannabis retail stores across the province. The province uses a fully private retail model with no government-run stores. Licensing is regulated by the Saskatchewan Liquor and Gaming Authority (SLGA).",
      },
      {
        q: "Can I grow cannabis at home in Saskatchewan?",
        a: "Yes. Adults 19+ in Saskatchewan can grow up to 4 cannabis plants per household for personal use. Seeds or seedlings must be obtained from a legally licensed source. Plants should not be visible from public spaces, and landlords may restrict growing in rental properties.",
      },
      {
        q: "What happens if I drive high in Saskatchewan?",
        a: "Saskatchewan imposes immediate 24-hour vehicle impoundment and licence suspension for any driver suspected of being drug-impaired. New drivers face zero tolerance. Federal criminal penalties apply at 2+ ng/mL THC blood levels, which can include fines, imprisonment, and a criminal record.",
      },
    ],
  },
  "nova-scotia": {
    slug: "nova-scotia",
    name: "Nova Scotia",
    abbreviation: "NS",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Government monopoly through NSLC (Nova Scotia Liquor Corporation). All cannabis retail is run by NSLC stores and their online platform. No private retailers.",
    consumptionRules:
      "Permitted anywhere tobacco smoking is allowed, including private residences, outdoor public spaces, and sidewalks. Banned in vehicles, workplaces, schools, daycares, hospital grounds, and enclosed public spaces. Some municipalities have additional restrictions.",
    deliveryLaws:
      "Legal through NSLC online store. Orders ship across Nova Scotia via Canada Post. Age verification (19+) required at delivery. No private delivery services for cannabis.",
    growingRules:
      "Up to 4 plants per household for personal use. Plants must come from legally obtained seeds. Not visible from public areas. Landlords and condo boards may restrict growing in rental or strata properties.",
    drivingRules:
      "Immediate 7-day licence suspension and vehicle impoundment for suspected drug-impaired driving. Zero tolerance for new drivers. Federal criminal thresholds apply. Roadside oral fluid screening authorized.",
    keyFact:
      "Government-run NSLC is the sole legal retailer for cannabis products in Nova Scotia.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in Nova Scotia?",
        a: "The legal age to purchase cannabis in Nova Scotia is 19. You must present valid government photo ID at NSLC stores and for online orders. This applies to all cannabis products.",
      },
      {
        q: "Where can I buy cannabis in Nova Scotia?",
        a: "Cannabis in Nova Scotia can only be purchased through NSLC (Nova Scotia Liquor Corporation) stores or their online platform. There are no privately owned cannabis retail stores. The NSLC operates dedicated cannabis sections within many of their existing liquor store locations across the province.",
      },
      {
        q: "Can I smoke cannabis in public in Nova Scotia?",
        a: "Yes, Nova Scotia allows cannabis consumption in most places where tobacco smoking is permitted. This includes many outdoor public areas and sidewalks. However, it remains banned in vehicles, enclosed public spaces, workplaces, schools, hospital grounds, and daycares. Some municipalities have enacted stricter local rules.",
      },
      {
        q: "Can I grow cannabis plants in Nova Scotia?",
        a: "Yes. Adults 19+ can grow up to 4 cannabis plants per household for personal use in Nova Scotia. Plants must be grown from seeds obtained from a legal source (NSLC or licensed online retailer) and must not be visible from public areas.",
      },
      {
        q: "What are the penalties for cannabis-impaired driving in Nova Scotia?",
        a: "Nova Scotia imposes an immediate 7-day licence suspension and vehicle impoundment if you are suspected of drug-impaired driving. New and young drivers face zero tolerance. Federal criminal penalties also apply, with potential fines, imprisonment, and a permanent criminal record for THC levels above legal limits.",
      },
    ],
  },
  "new-brunswick": {
    slug: "new-brunswick",
    name: "New Brunswick",
    abbreviation: "NB",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Government monopoly through Cannabis NB, a Crown corporation. All retail stores are government-owned and operated. Online sales at cannabis-nb.com.",
    consumptionRules:
      "Private residences only. New Brunswick prohibits cannabis consumption in all public places, making it one of the most restrictive provinces. Banned in parks, sidewalks, vehicles, workplaces, and all areas accessible to the public.",
    deliveryLaws:
      "Legal through Cannabis NB online store (cannabis-nb.com). Ships across New Brunswick via Canada Post with age verification (19+) at delivery. No private delivery services.",
    growingRules:
      "Up to 4 plants per household for personal use. Plants must come from legal seeds or seedlings. Standard visibility and landlord restriction rules apply.",
    drivingRules:
      "Immediate licence suspension and vehicle impoundment for drug-impaired driving. Zero tolerance for GDL holders. Federal criminal thresholds for THC levels apply.",
    keyFact:
      "Cannabis NB (government-owned Crown corporation) operates all retail cannabis stores in the province.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in New Brunswick?",
        a: "You must be 19 years or older to purchase cannabis in New Brunswick. Valid government-issued ID is required at all Cannabis NB locations and for online purchases through cannabis-nb.com.",
      },
      {
        q: "Can I consume cannabis in public in New Brunswick?",
        a: "No. New Brunswick restricts all cannabis consumption to private residences only. Using cannabis in any public space — including parks, sidewalks, patios, and outdoor areas — is prohibited. This makes New Brunswick one of the most restrictive provinces for cannabis use.",
      },
      {
        q: "Where can I buy cannabis in New Brunswick?",
        a: "All legal cannabis in New Brunswick must be purchased through Cannabis NB, the province's Crown corporation. Cannabis NB operates retail stores across the province and an online store at cannabis-nb.com. No private cannabis retailers are permitted.",
      },
      {
        q: "Is home growing legal in New Brunswick?",
        a: "Yes. New Brunswick allows adults 19+ to grow up to 4 cannabis plants per household for personal use. Seeds must be purchased from a legal source. Plants cannot be visible from public spaces, and landlords may restrict growing in their properties.",
      },
      {
        q: "What happens if I drive under the influence of cannabis in New Brunswick?",
        a: "New Brunswick imposes immediate licence suspension and vehicle impoundment for suspected drug-impaired drivers. GDL (Graduated Driver Licensing) holders face zero tolerance. Federal criminal penalties apply at 2+ ng/mL THC, including fines, potential imprisonment, and a criminal record.",
      },
    ],
  },
  "newfoundland-and-labrador": {
    slug: "newfoundland-and-labrador",
    name: "Newfoundland and Labrador",
    abbreviation: "NL",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Private retail model licensed by the NLC (Newfoundland and Labrador Liquor Corporation). Licensed private stores operate across the province. Online sales through the NLC-regulated platform.",
    consumptionRules:
      "Permitted in private residences and some outdoor areas where tobacco smoking is allowed, subject to municipal bylaws. Banned in vehicles, workplaces, enclosed public places, school properties, and hospital grounds.",
    deliveryLaws:
      "Legal through licensed retailers and online platforms. Age verification (19+) required at delivery. NLC-regulated online sales ship across the province.",
    growingRules:
      "Up to 4 plants per household for personal use. Standard rules apply: legal seeds, not visible from public, subject to landlord restrictions.",
    drivingRules:
      "Immediate 24-hour driving suspension for suspected impaired driving. Zero tolerance for new drivers. Federal criminal thresholds apply.",
    keyFact:
      "First province to complete a legal cannabis sale on October 17, 2018 at midnight.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in Newfoundland and Labrador?",
        a: "The legal age to purchase cannabis in Newfoundland and Labrador is 19. This applies to all cannabis products and methods of purchase. Valid government photo ID is required for every transaction.",
      },
      {
        q: "Where can I buy cannabis in Newfoundland and Labrador?",
        a: "Cannabis is sold through licensed private retail stores regulated by the NLC (Newfoundland and Labrador Liquor Corporation). There are licensed cannabis stores in communities across the province. Online purchasing is also available through NLC-regulated platforms.",
      },
      {
        q: "Can I smoke cannabis in public in Newfoundland and Labrador?",
        a: "Cannabis can be consumed in private residences and some outdoor areas where tobacco smoking is permitted. However, individual municipalities may have stricter bylaws. It is always prohibited in vehicles, workplaces, enclosed public spaces, schools, and hospital grounds.",
      },
      {
        q: "Is home growing allowed in Newfoundland and Labrador?",
        a: "Yes. Adults 19+ can grow up to 4 cannabis plants per household for personal use. Plants must be grown from legally obtained seeds and should not be visible from public areas. Landlords may impose restrictions in rental properties.",
      },
      {
        q: "Was Newfoundland really the first province to sell legal cannabis?",
        a: "Yes. Due to its time zone (NST is 1.5 hours ahead of EST), Newfoundland and Labrador was the first province in Canada to complete a legal recreational cannabis sale at 12:01 AM on October 17, 2018, making history.",
      },
    ],
  },
  "prince-edward-island": {
    slug: "prince-edward-island",
    name: "Prince Edward Island",
    abbreviation: "PE",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Government-run PEI Cannabis stores operated by the PEI Liquor Control Commission. No private retail stores. Online sales available through the PEI Cannabis website.",
    consumptionRules:
      "Private residences and some outdoor areas where tobacco smoking is allowed. Banned in vehicles, workplaces, enclosed public places, schools, playgrounds, and hospital grounds. Municipal bylaws may add further restrictions.",
    deliveryLaws:
      "Legal through PEI Cannabis online store. Ships across PEI via Canada Post with age verification (19+) at delivery. No private delivery options.",
    growingRules:
      "Up to 4 plants per household for personal use. Standard rules: legal seeds, not visible from public spaces, landlord may restrict in rentals.",
    drivingRules:
      "Immediate licence suspension for drug-impaired driving. Zero tolerance for new drivers. Federal criminal thresholds apply.",
    keyFact:
      "Government-run PEI Cannabis stores are the sole retail option on the island. Smallest province with one of the most controlled cannabis markets.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in Prince Edward Island?",
        a: "The legal age in PEI is 19. You must provide valid government-issued photo ID for all cannabis purchases at PEI Cannabis stores or online.",
      },
      {
        q: "Where can I buy cannabis in PEI?",
        a: "Cannabis in PEI can only be purchased at government-run PEI Cannabis stores or through their online platform. There are no private cannabis retailers on the island. The PEI Liquor Control Commission operates all cannabis retail locations.",
      },
      {
        q: "Can I smoke cannabis in public on PEI?",
        a: "PEI allows cannabis consumption in private residences and some outdoor areas where tobacco is permitted. However, it is banned in vehicles, enclosed public spaces, workplaces, school properties, playgrounds, and hospitals. Some municipalities may have additional restrictions.",
      },
      {
        q: "Can I grow cannabis at home in PEI?",
        a: "Yes. PEI allows adults 19+ to grow up to 4 plants per household for personal use. Seeds must come from a legal source, and plants should not be visible from public areas. Landlords may restrict growing in rental properties.",
      },
      {
        q: "How does cannabis delivery work in PEI?",
        a: "Cannabis can be ordered online through PEI Cannabis and shipped across the island via Canada Post. Age verification (19+) with government ID is required at the time of delivery. There are no private cannabis delivery services available in PEI.",
      },
    ],
  },
  "northwest-territories": {
    slug: "northwest-territories",
    name: "Northwest Territories",
    abbreviation: "NT",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Mixed model: government-run NTLC (Northwest Territories Liquor and Cannabis Commission) stores and licensed private retailers in some communities. Online sales through NTLC.",
    consumptionRules:
      "Private residences and some areas where tobacco smoking is allowed. Banned in vehicles, workplaces, enclosed public spaces, and school grounds. Community governments can set additional restrictions.",
    deliveryLaws:
      "Legal through NTLC online store. Shipping across the NWT with age verification (19+). Remote communities may experience longer delivery times.",
    growingRules:
      "Up to 4 plants per household for personal use. Standard federal rules apply. Community governments may impose additional restrictions.",
    drivingRules:
      "Immediate 24-hour licence suspension for suspected drug-impaired driving. Zero tolerance for new drivers. Federal criminal thresholds apply.",
    keyFact:
      "Communities can hold plebiscites to ban cannabis sales in their area, similar to alcohol plebiscites used in many NWT communities.",
    faqs: [
      {
        q: "What is the legal age for cannabis in the Northwest Territories?",
        a: "The legal age is 19 in the Northwest Territories. Valid government-issued ID is required for all cannabis purchases.",
      },
      {
        q: "Can communities in the NWT ban cannabis?",
        a: "Yes. Similar to the alcohol plebiscite system, NWT communities can hold votes to restrict or ban cannabis sales in their jurisdiction. This gives local communities significant control over cannabis access in their area.",
      },
      {
        q: "Where can I buy cannabis in the Northwest Territories?",
        a: "Cannabis is available at NTLC (Northwest Territories Liquor and Cannabis Commission) stores and some licensed private retailers. Not all communities have physical stores, so online ordering through NTLC with delivery across the territory is an important option for remote communities.",
      },
      {
        q: "Can I grow cannabis at home in the NWT?",
        a: "Yes. Adults 19+ can grow up to 4 cannabis plants per household. Federal rules apply, and community governments may set additional restrictions. Seeds must come from a legal source.",
      },
      {
        q: "How does cannabis delivery work in remote NWT communities?",
        a: "The NTLC online store ships cannabis across the Northwest Territories. Delivery to remote communities may take longer due to geographic distances and limited transportation infrastructure. Age verification (19+) is required at delivery.",
      },
    ],
  },
  yukon: {
    slug: "yukon",
    name: "Yukon",
    abbreviation: "YT",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Mixed model: government-run Cannabis Yukon stores and licensed private retailers. Online sales through Cannabis Yukon's website.",
    consumptionRules:
      "Private residences and many public areas where tobacco smoking is allowed. Banned in vehicles, workplaces, enclosed public places, school grounds, playgrounds, and near hospital entrances. Municipal bylaws may add restrictions.",
    deliveryLaws:
      "Legal through Cannabis Yukon online store. Ships across the territory with age verification (19+) at delivery.",
    growingRules:
      "Up to 4 plants per household for personal use. Federal rules apply. Plants must not be visible from public spaces and must come from legal seeds.",
    drivingRules:
      "Immediate 24-hour licence suspension for suspected drug-impaired driving. Zero tolerance for new and young drivers. Federal criminal thresholds apply.",
    keyFact:
      "Government-run Cannabis Yukon stores and licensed private retailers operate in the territory.",
    faqs: [
      {
        q: "What is the legal age to buy cannabis in Yukon?",
        a: "You must be 19 or older to purchase cannabis in Yukon. Valid government-issued photo ID is required for all purchases.",
      },
      {
        q: "Where can I buy cannabis in Yukon?",
        a: "Cannabis is available at government-run Cannabis Yukon stores and licensed private retailers. Online ordering through Cannabis Yukon's website with territory-wide shipping is also available.",
      },
      {
        q: "Can I use cannabis in public in Yukon?",
        a: "Yukon allows cannabis consumption in many public areas where tobacco smoking is permitted, as well as in private residences. It is banned in vehicles, enclosed public spaces, workplaces, schools, playgrounds, and near hospital entrances.",
      },
      {
        q: "Can I grow cannabis at home in Yukon?",
        a: "Yes. Adults 19+ in Yukon can grow up to 4 cannabis plants per household for personal use. Standard federal rules apply, including sourcing seeds from legal retailers and keeping plants out of public view.",
      },
      {
        q: "What are the driving rules for cannabis in Yukon?",
        a: "Yukon enforces immediate 24-hour licence suspension for suspected drug-impaired driving. New and young drivers face zero tolerance. Federal criminal thresholds (2-5 ng/mL and 5+ ng/mL THC) apply, with penalties ranging from fines to imprisonment.",
      },
    ],
  },
  nunavut: {
    slug: "nunavut",
    name: "Nunavut",
    abbreviation: "NU",
    legalAge: 19,
    possessionLimit: "30g dried",
    purchaseLimit: "30g per transaction",
    retailModel:
      "Government-controlled online sales only through the Nunavut Liquor and Cannabis Commission (NULC). No physical retail stores exist in the territory. Cannabis is ordered online and shipped to communities.",
    consumptionRules:
      "Private residences only. Nunavut restricts cannabis consumption to private homes. Banned in all public spaces, vehicles, workplaces, and anywhere accessible to the public.",
    deliveryLaws:
      "Online ordering through NULC is the only legal purchase method. Cannabis ships to communities across Nunavut. Delivery times vary significantly based on remoteness. Age verification (19+) at delivery.",
    growingRules:
      "Up to 4 plants per household for personal use. Federal rules apply. The short growing season and climate make outdoor cultivation impractical; indoor growing with artificial lighting is the only viable option.",
    drivingRules:
      "Immediate licence suspension for drug-impaired driving. Zero tolerance for new drivers. Federal criminal thresholds apply.",
    keyFact:
      "No physical cannabis retail stores exist in Nunavut. Online ordering through the government portal is the only legal way to purchase cannabis.",
    faqs: [
      {
        q: "What is the legal age for cannabis in Nunavut?",
        a: "The legal age to purchase cannabis in Nunavut is 19. Valid government-issued photo ID is required for all purchases and delivery.",
      },
      {
        q: "How do I buy cannabis in Nunavut?",
        a: "Nunavut has no physical cannabis retail stores. The only legal way to purchase cannabis is through the Nunavut Liquor and Cannabis Commission (NULC) online store. Orders are shipped to your community, with delivery times varying based on location and logistics.",
      },
      {
        q: "Can I smoke cannabis in public in Nunavut?",
        a: "No. Nunavut restricts all cannabis consumption to private residences. It is illegal to use cannabis in any public space, vehicle, workplace, or area accessible to the public.",
      },
      {
        q: "Can I grow cannabis at home in Nunavut?",
        a: "Yes. The federal limit of 4 plants per household applies in Nunavut. However, due to the extreme climate and short growing season, outdoor cultivation is essentially impossible. Indoor growing with artificial lighting is the only practical option for home growers in the territory.",
      },
      {
        q: "How long does cannabis delivery take in Nunavut?",
        a: "Delivery times in Nunavut vary significantly depending on your community's location and the available transportation infrastructure. Remote communities accessible only by air may experience longer wait times, especially during winter months. The NULC ships orders as quickly as logistics allow, but residents should plan for potentially extended delivery periods.",
      },
    ],
  },
};

// ─── Static Params Generation ────────────────────────────────────────

export async function generateStaticParams() {
  return Object.keys(PROVINCE_LAWS).map((slug) => ({
    province: slug,
  }));
}

// ─── Metadata Generation ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ province: string }>;
}): Promise<Metadata> {
  const { province: provinceSlug } = await params;
  const law = PROVINCE_LAWS[provinceSlug];

  if (!law) {
    return {
      title: "Province Not Found | Mohawk Medibles",
      description: "The cannabis law guide for this province was not found.",
    };
  }

  const title = `Cannabis Laws in ${law.name} 2026 | ${law.legalAge}+, ${law.possessionLimit} | Mohawk Medibles`;
  const description = `Complete guide to cannabis laws in ${law.name} for 2026. Legal age ${law.legalAge}+, possession limit ${law.possessionLimit}, consumption rules, home growing, delivery laws, and driving regulations. Everything you need to know about ${law.name} cannabis regulations.`;
  const canonical = `https://mohawkmedibles.ca/cannabis-laws/${law.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    keywords: [
      `cannabis laws ${law.name.toLowerCase()}`,
      `weed laws ${law.name.toLowerCase()}`,
      `marijuana laws ${law.name.toLowerCase()}`,
      `cannabis legal age ${law.name.toLowerCase()}`,
      `cannabis rules ${law.abbreviation.toLowerCase()}`,
      `can you smoke weed in ${law.name.toLowerCase()}`,
      `home growing cannabis ${law.name.toLowerCase()}`,
      `cannabis delivery ${law.name.toLowerCase()}`,
      `cannabis driving laws ${law.name.toLowerCase()}`,
      `${law.name.toLowerCase()} cannabis regulations 2026`,
    ],
    openGraph: {
      title: `Cannabis Laws in ${law.name} — Complete 2026 Guide | Mohawk Medibles`,
      description,
      url: canonical,
      type: "website",
      siteName: "Mohawk Medibles",
      images: [
        {
          url: "https://mohawkmedibles.ca/og-image.png",
          width: 1200,
          height: 630,
          alt: `Cannabis Laws in ${law.name} 2026 — Mohawk Medibles Guide`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Cannabis Laws in ${law.name} 2026 | Mohawk Medibles`,
      description,
      images: [
        {
          url: "https://mohawkmedibles.ca/og-image.png",
          width: 1200,
          height: 630,
          alt: `Cannabis Laws in ${law.name} 2026 — Mohawk Medibles Guide`,
        },
      ],
    },
  };
}

// ─── Helper: Section Card Component ──────────────────────────────────

function LawSection({
  icon,
  title,
  content,
}: {
  icon: string;
  title: string;
  content: string;
}) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
      <div className="flex items-start gap-4">
        <span className="w-10 h-10 rounded-full bg-forest/10 dark:bg-lime/10 flex items-center justify-center text-forest dark:text-lime text-lg flex-shrink-0 mt-1">
          {icon}
        </span>
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Server Component ───────────────────────────────────────────

export default async function ProvinceCannabisLawPage({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province: provinceSlug } = await params;
  const law = PROVINCE_LAWS[provinceSlug];

  if (!law) {
    notFound();
  }

  // Build all sibling provinces for cross-linking
  const siblingProvinces = Object.values(PROVINCE_LAWS).filter(
    (p) => p.slug !== law.slug
  );

  // Build schemas using shared helpers
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "Cannabis Laws", url: "https://mohawkmedibles.ca/cannabis-laws" },
    {
      name: law.name,
      url: `https://mohawkmedibles.ca/cannabis-laws/${law.slug}`,
    },
  ]);

  const faqItems = law.faqs.map((f) => ({
    question: f.q,
    answer: f.a,
  }));
  const faqs = faqSchema(faqItems);

  // All JSON-LD data is static hardcoded constants — safe to inject directly
  const breadcrumbsJson = JSON.stringify(breadcrumbs);
  const faqsJson = JSON.stringify(faqs);

  return (
    <>
      {/* JSON-LD Structured Data — all data is static constants, safe to render */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbsJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqsJson }}
      />

      <main className="min-h-screen pt-32 pb-20 page-glass text-foreground">
        <div className="container mx-auto px-6">
          {/* Breadcrumb Navigation */}
          <nav
            className="mb-12 text-sm text-muted-foreground"
            aria-label="breadcrumb"
          >
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <span>&rarr;</span>
              <Link
                href="/cannabis-laws"
                className="hover:text-foreground transition-colors"
              >
                Cannabis Laws
              </Link>
              <span>&rarr;</span>
              <span className="text-forest dark:text-lime font-medium">
                {law.name}
              </span>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-forest/10 dark:bg-lime/10 border border-forest/20 dark:border-lime/20 text-forest dark:text-lime mb-6">
              {law.abbreviation} &mdash; Updated 2026
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase text-foreground mb-6">
              Cannabis Laws in {law.name} — Complete 2026 Guide
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl leading-relaxed">
              Everything you need to know about cannabis regulations in{" "}
              {law.name}. From legal age and possession limits to where you can
              consume, home growing rules, delivery laws, and driving
              regulations. {law.keyFact}
            </p>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
              <div className="text-4xl font-bold text-forest dark:text-lime mb-2">
                {law.legalAge}+
              </div>
              <p className="text-muted-foreground text-sm">Legal Age</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
              <div className="text-lg font-bold text-forest dark:text-lime mb-2">
                {law.possessionLimit}
              </div>
              <p className="text-muted-foreground text-sm">
                Possession Limit
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
              <div className="text-lg font-bold text-forest dark:text-lime mb-2">
                {law.purchaseLimit}
              </div>
              <p className="text-muted-foreground text-sm">Purchase Limit</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
              <div className="text-lg font-bold text-forest dark:text-lime mb-2">
                {law.growingRules.includes("PROHIBITED") ? "Banned" : "4 plants"}
              </div>
              <p className="text-muted-foreground text-sm">Home Growing</p>
            </div>
          </div>

          {/* Retail Model Overview */}
          <section className="mb-20">
            <div className="glass-card p-8 rounded-2xl border border-forest/30 dark:border-lime/30 bg-forest/5 dark:bg-lime/5">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-forest/20 dark:bg-lime/20 flex items-center justify-center text-forest dark:text-lime text-lg">
                  &sect;
                </span>
                How Cannabis Is Sold in {law.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {law.retailModel}
              </p>
            </div>
          </section>

          {/* Law Sections */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase text-foreground mb-4">
              {law.name} Cannabis Regulations
            </h2>
            <p className="text-muted-foreground mb-12">
              Detailed breakdown of all cannabis rules and regulations in{" "}
              {law.name} for 2026
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LawSection
                icon="&#x2713;"
                title={`Legal Age in ${law.name}`}
                content={`The legal age to purchase, possess, and consume cannabis in ${law.name} is ${law.legalAge} years old. Valid government-issued photo ID is required for all purchases. This applies to all cannabis products including dried flower, edibles, concentrates, topicals, and accessories.`}
              />
              <LawSection
                icon="&#x2696;"
                title="Possession & Purchase Limits"
                content={`Adults in ${law.name} can possess up to ${law.possessionLimit} of cannabis (or equivalent) in public. The purchase limit is ${law.purchaseLimit}. At home, you may store cannabis purchased legally or harvested from legal home-grown plants (where permitted) without a specific limit.`}
              />
              <LawSection
                icon="&#x2302;"
                title="Where You Can Consume"
                content={law.consumptionRules}
              />
              <LawSection
                icon="&#x2618;"
                title="Home Growing Rules"
                content={law.growingRules}
              />
              <LawSection
                icon="&#x2709;"
                title={`Cannabis Delivery in ${law.name}`}
                content={law.deliveryLaws}
              />
              <LawSection
                icon="&#x26A0;"
                title="Driving & Cannabis"
                content={law.drivingRules}
              />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase text-foreground mb-4">
              {law.name} Cannabis Law FAQs
            </h2>
            <p className="text-muted-foreground mb-12">
              Frequently asked questions about cannabis regulations in{" "}
              {law.name}
            </p>
            <div className="space-y-4">
              {law.faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="glass-card p-6 rounded-2xl border border-border group"
                  {...(idx === 0 ? { open: true } : {})}
                >
                  <summary className="cursor-pointer font-bold text-lg text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors flex items-center justify-between">
                    {faq.q}
                    <span className="text-forest dark:text-lime transition-transform group-open:rotate-180 flex-shrink-0 ml-4">
                      &darr;
                    </span>
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mb-20">
            <div className="glass-card p-12 rounded-3xl border border-border text-center">
              <h2 className="text-4xl font-bold text-foreground mb-4 uppercase tracking-tighter">
                Shop Cannabis for {law.name}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Mohawk Medibles delivers premium, lab-tested cannabis products
                to {law.name}. Browse our full selection of flower, edibles,
                concentrates, vapes, and more. Free shipping on orders over $199.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="brand" size="lg">
                  <Link href="/shop">Shop Premium Cannabis</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={`/delivery/${law.slug}`}>
                    {law.name} Delivery Info
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Other Provinces */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-foreground mb-4">
              Cannabis Laws in Other Provinces
            </h2>
            <p className="text-muted-foreground mb-8">
              Compare cannabis regulations across all Canadian provinces and
              territories.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {siblingProvinces.map((prov) => (
                <Link
                  key={prov.slug}
                  href={`/cannabis-laws/${prov.slug}`}
                >
                  <div className="glass-card p-4 rounded-xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all text-center group">
                    <p className="text-xs text-muted-foreground mb-1">
                      {prov.abbreviation}
                    </p>
                    <p className="font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors text-sm">
                      {prov.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Age: {prov.legalAge}+
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Back to Hub Link */}
          <div className="text-center">
            <Link
              href="/cannabis-laws"
              className="text-forest dark:text-lime hover:underline font-medium"
            >
              &larr; Back to Cannabis Laws Hub — All Provinces
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
