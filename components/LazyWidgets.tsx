"use client";

import dynamic from "next/dynamic";

const AgentChatWidget = dynamic(() => import("@/components/AgentChatWidget"), { ssr: false });
const AgeGate = dynamic(() => import("@/components/AgeGate"), { ssr: false });
const ConsentBanner = dynamic(() => import("@/components/ConsentBanner"), { ssr: false });
const BackToTop = dynamic(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })), { ssr: false });
const ExitIntentPopup = dynamic(() => import("@/components/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })), { ssr: false });
const FirstTimeBuyerPopup = dynamic(() => import("@/components/FirstTimeBuyerPopup").then(m => ({ default: m.FirstTimeBuyerPopup })), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette").then(m => ({ default: m.CommandPalette })), { ssr: false });
const LivePurchaseNotification = dynamic(() => import("@/components/LivePurchaseNotification"), { ssr: false });

export default function LazyWidgets() {
    return (
        <>
            <AgentChatWidget />
            <AgeGate />
            <ConsentBanner />
            <BackToTop />
            <ExitIntentPopup />
            <FirstTimeBuyerPopup />
            <CommandPalette />
            <LivePurchaseNotification />
        </>
    );
}
