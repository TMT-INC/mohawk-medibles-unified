"""
Support Agent — Customer support with real order lookups via database API.
Queries /api/agent/data for live order data and customer information.
"""
import os
import re
import httpx

NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")
AGENT_SECRET = os.getenv("AGENT_API_SECRET", os.getenv("AUTH_SECRET", ""))


class SupportAgent:
    def __init__(self):
        self.api_base = f"{NEXTJS_URL}/api/agent/data"
        self.headers = {"Authorization": f"Bearer {AGENT_SECRET}"}
        self.intents = {
            "hours": "Our hours are **9am – 10pm daily** (EST). We're based on Tyendinaga Mohawk Territory, Ontario.",
            "shipping": (
                "We offer **Canada-wide shipping** via Canada Post Xpresspost (2–5 business days). "
                "Orders over $100 ship **FREE**! Same-day local delivery available for Brantford & Hamilton area."
            ),
            "returns": (
                "Due to the nature of cannabis products, **all sales are final**. "
                "If you received a damaged or incorrect item, please contact us within 48 hours and we'll make it right."
            ),
            "payment": "We accept **Visa, Mastercard, and Google Pay**. All transactions are secured by Stripe.",
            "age": "You must be **19 years of age or older** to purchase from Mohawk Medibles, as required by Ontario law.",
        }

    async def _fetch(self, params: dict) -> dict:
        """Fetch data from the Next.js Agent Data API."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(self.api_base, params=params, headers=self.headers)
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            print(f"[SupportAgent] API error: {e}")
            return {"error": str(e)}

    async def process(self, message: str, session_id: str) -> str:
        """Process a customer support message."""
        msg = message.lower().strip()

        # ── Check for order number in message ────────────────
        order_match = re.search(r"#?MM-[A-Z0-9]+-[A-Z0-9]+", message, re.IGNORECASE)
        if order_match:
            order_number = order_match.group().lstrip("#").upper()
            data = await self._fetch({"type": "order", "query": order_number})

            if data.get("found"):
                order = data["order"]
                status = order["status"].replace("_", " ").title()
                lines = [f"Here's the status for order **{order['orderNumber']}**:"]
                lines.append(f"• Status: **{status}**")
                lines.append(f"• Total: ${order['total']:.2f} CAD")

                if order.get("trackingNumber"):
                    lines.append(f"• Tracking: {order['trackingNumber']} ({order.get('carrier', 'Canada Post')})")
                    lines.append(f"• [Track your package](https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor={order['trackingNumber']})")

                if order.get("items"):
                    item_names = ", ".join([i["name"] for i in order["items"][:5]])
                    lines.append(f"• Items: {item_names}")

                return "\n".join(lines)
            else:
                return f"I couldn't find order **{order_number}**. Please double-check the order number — it should look like MM-XXXX-XXXX."

        # ── Check for email-based order lookup ───────────────
        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", message)
        if email_match and ("order" in msg or "purchase" in msg or "track" in msg):
            email = email_match.group().lower()
            data = await self._fetch({"type": "orders-by-email", "query": email})

            orders = data.get("orders", [])
            if orders:
                lines = [f"Found **{data.get('count', 0)}** order(s) for {email}:"]
                for o in orders[:5]:
                    status = o["status"].replace("_", " ").title()
                    lines.append(f"• **{o['orderNumber']}** — {status} — ${o['total']:.2f}")
                return "\n".join(lines)
            else:
                return f"No orders found for {email}. If you recently placed an order, it may take a few minutes to appear."

        # ── Order/tracking intent without specific ID ────────
        if "order" in msg or "tracking" in msg or ("where" in msg and "package" in msg):
            return (
                "I can help you track your order! Please provide your **order number** (e.g., MM-XXXX-XXXX) "
                "or the **email address** you used at checkout."
            )

        # ── Static intent matching ───────────────────────────
        for key, response in self.intents.items():
            if key in msg:
                return response

        # ── Default response ─────────────────────────────────
        return (
            "I'm here to help! You can ask me about:\n"
            "• **Order tracking** — give me your order number (MM-XXXX-XXXX)\n"
            "• **Shipping** info and delivery times\n"
            "• **Store hours** and location\n"
            "• **Returns** policy\n"
            "• **Payment** methods\n\n"
            "Or try our **MedAgent** chat for product recommendations!"
        )


# Singleton
support_bot = SupportAgent()
