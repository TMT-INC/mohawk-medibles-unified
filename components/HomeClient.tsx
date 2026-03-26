"use client";

import { HeroCarousel } from "@/components/HeroCarousel";
import { BentoGrid } from "@/components/BentoGrid";
import { DealTicker } from "@/components/DealTicker";
import DealOfTheDay from "@/components/DealOfTheDay";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { StickyMobileNav } from "@/components/StickyMobileNav";
import { CategoryBrandShowcase } from "@/components/CategoryBrandShowcase";
import { BenefitsBar } from "@/components/BenefitsBar";
import { MonthlyDeals } from "@/components/MonthlyDeals";
import { HowItWorks } from "@/components/HowItWorks";
import NewArrivals from "@/components/NewArrivals";
import GoogleReviewsWidget from "@/components/GoogleReviewsWidget";
import ContestBanner from "@/components/ContestBanner";
import ShopByMood from "@/components/ShopByMood";
import MixMatchCTA from "@/components/MixMatchCTA";
import StorePromo from "@/components/StorePromo";
import { SafeSection } from "@/components/SafeSection";

export default function HomeClient() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <SafeSection name="ContestBanner"><ContestBanner /></SafeSection>
      <SafeSection name="HeroCarousel"><HeroCarousel /></SafeSection>
      <SafeSection name="BenefitsBar"><BenefitsBar /></SafeSection>
      <SafeSection name="DealTicker"><DealTicker /></SafeSection>
      <SafeSection name="CategoryBrandShowcase"><CategoryBrandShowcase /></SafeSection>
      <SafeSection name="NewArrivals"><NewArrivals /></SafeSection>
      <SafeSection name="MonthlyDeals"><MonthlyDeals /></SafeSection>
      <SafeSection name="ShopByMood"><ShopByMood /></SafeSection>
      <SafeSection name="MixMatchCTA"><MixMatchCTA /></SafeSection>
      <SafeSection name="DealOfTheDay"><DealOfTheDay /></SafeSection>
      <SafeSection name="BentoGrid"><BentoGrid /></SafeSection>
      <SafeSection name="HowItWorks"><HowItWorks /></SafeSection>
      <SafeSection name="GoogleReviewsWidget"><GoogleReviewsWidget /></SafeSection>
      <SafeSection name="StorePromo"><StorePromo /></SafeSection>
      <SafeSection name="ReviewCarousel"><ReviewCarousel /></SafeSection>
      <SafeSection name="StickyMobileNav"><StickyMobileNav /></SafeSection>
    </div>
  );
}
