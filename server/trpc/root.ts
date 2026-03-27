/**
 * Root tRPC Router — Combines all sub-routers
 * This is the single entry point for all tRPC procedures.
 */
import { router } from "./trpc";
import { posRouter } from "./routers/pos";
import { inventoryRouter } from "./routers/inventory";
import { reportingRouter } from "./routers/reporting";
import { teamRouter } from "./routers/team";
import { rewardsRouter } from "./routers/rewards";
import { restockAlertsRouter } from "./routers/restockAlerts";
import { reviewRequestsRouter } from "./routers/reviewRequests";
import { reviewIncentivesRouter } from "./routers/reviewIncentives";
import { customerSegmentsRouter } from "./routers/customerSegments";
import { subscriptionsRouter } from "./routers/subscriptions";
import { compareRouter } from "./routers/compare";
import { affiliateRouter } from "./routers/affiliate";
import { productsRouter } from "./routers/products";
import { fraudRouter } from "./routers/fraud";
import { smsRouter } from "./routers/sms";
import { googleReviewsRouter } from "./routers/googleReviews";
import { happyHourRouter } from "./routers/happyHour";
import { pushRouter } from "./routers/push";
import { contestRouter } from "./routers/contest";
import { ordersRouter } from "./routers/orders";
import { wholesaleRouter } from "./routers/wholesale";
import { scannerRouter } from "./routers/scanner";
import { giftTiersRouter } from "./routers/giftTiers";
import { wishlistShareRouter } from "./routers/wishlistShare";
import { dailyDealsRouter } from "./routers/dailyDeals";
import { priceMatchRouter } from "./routers/priceMatch";
import { pricingRouter } from "./routers/pricing";
import { accountingRouter } from "./routers/accounting";

export const appRouter = router({
  pos: posRouter,
  inventory: inventoryRouter,
  reporting: reportingRouter,
  team: teamRouter,
  rewards: rewardsRouter,
  restockAlerts: restockAlertsRouter,
  reviewRequests: reviewRequestsRouter,
  reviewIncentives: reviewIncentivesRouter,
  customerSegments: customerSegmentsRouter,
  subscriptions: subscriptionsRouter,
  compare: compareRouter,
  affiliate: affiliateRouter,
  products: productsRouter,
  fraud: fraudRouter,
  sms: smsRouter,
  googleReviews: googleReviewsRouter,
  happyHour: happyHourRouter,
  push: pushRouter,
  contest: contestRouter,
  orders: ordersRouter,
  wholesale: wholesaleRouter,
  scanner: scannerRouter,
  giftTiers: giftTiersRouter,
  wishlistShare: wishlistShareRouter,
  dailyDeals: dailyDealsRouter,
  priceMatch: priceMatchRouter,
  pricing: pricingRouter,
  accounting: accountingRouter,
});

export type AppRouter = typeof appRouter;
