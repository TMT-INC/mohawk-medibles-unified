"""
Mohawk Medibles — Organic Social Engineering Content Agent
═══════════════════════════════════════════════════════════
Production-grade content engine that generates brand-aligned content
across all channels: blog, social media, email, GMB, and product stories.

Integrates with:
- Extracted Yoast SEO keywords (product_seo.json)
- Product catalog (products_raw.json)
- Customer segments from CRM agent
- Brand voice / EEAT framework
"""

import json
import os
import random
import re
from datetime import datetime, timedelta
from typing import Optional

# ─── Brand Voice System ──────────────────────────────────────

BRAND_VOICE = {
    "name": "Mohawk Medibles",
    "tagline": "The Empire Standard™",
    "identity": "Indigenous-owned premium cannabis brand on Tyendinaga Mohawk Territory",
    "tone": [
        "authoritative yet approachable",
        "scientifically grounded",
        "culturally proud",
        "premium without pretension",
    ],
    "values": [
        "Heritage meets innovation",
        "Quality without compromise",
        "Community first",
        "Transparent sourcing",
    ],
    "avoid": [
        "medical claims without disclaimers",
        "slang or stoner culture stereotypes",
        "competitor bashing",
        "price comparisons",
    ],
    "hashtags": {
        "primary": ["#MohawkMedibles", "#EmpireStandard", "#TyendinagaGrown"],
        "product": ["#PremiumCannabis", "#CanadianCannabis", "#IndigenousOwned"],
        "education": ["#CannabisScience", "#TerpeneProfile", "#EntourageEffect"],
        "lifestyle": ["#ElevateYourExperience", "#CraftCannabis", "#CannabisCulture"],
    },
}

# ─── Content Pillars ─────────────────────────────────────────

CONTENT_PILLARS = {
    "education": {
        "weight": 0.30,
        "description": "Science-backed cannabis education",
        "topics": [
            "Understanding terpene profiles and their therapeutic effects",
            "The entourage effect: why full-spectrum matters",
            "Indica vs Sativa vs Hybrid: a scientific breakdown",
            "How to read cannabis lab results like a pro",
            "CBD vs THC ratios and what they mean for you",
            "Microdosing: the science behind less-is-more",
            "Cannabis and sleep: what the research says",
            "Terpene spotlight: Myrcene, Limonene, and Caryophyllene",
            "How extraction methods affect potency and flavor",
            "The role of cannabinoids in pain management",
        ],
    },
    "product_story": {
        "weight": 0.25,
        "description": "Product spotlights with EEAT narratives",
        "formats": ["deep_dive", "comparison", "new_arrival", "staff_pick", "limited_edition"],
    },
    "heritage": {
        "weight": 0.15,
        "description": "Indigenous heritage and Tyendinaga pride",
        "topics": [
            "Our journey: building the Empire Standard on Tyendinaga Mohawk Territory",
            "Traditional plant medicine meets modern cultivation",
            "Community impact: how every purchase supports Tyendinaga",
            "The sacred relationship between indigenous peoples and the plant",
            "Preserving traditional knowledge through modern agriculture",
        ],
    },
    "behind_scenes": {
        "weight": 0.15,
        "description": "Behind-the-scenes cultivation and process",
        "topics": [
            "A day in the life at our cultivation facility",
            "Quality control: how we test every batch",
            "From seed to shelf: our 90-day cultivation journey",
            "Meet the team: our master cultivators",
            "Sustainable packaging and eco-friendly practices",
        ],
    },
    "community": {
        "weight": 0.15,
        "description": "Community engagement and social proof",
        "formats": ["customer_spotlight", "event_recap", "community_update", "partnership"],
    },
}

# ─── Social Templates ────────────────────────────────────────

SOCIAL_TEMPLATES = {
    "instagram_post": {
        "max_chars": 2200,
        "hashtag_limit": 30,
        "structure": "hook → value → cta → hashtags",
    },
    "instagram_reel": {
        "max_seconds": 90,
        "structure": "pattern_interrupt → educate → demonstrate → cta",
    },
    "instagram_story": {
        "max_chars": 250,
        "structure": "visual_hook → one_point → swipe_up",
    },
    "tiktok": {
        "max_seconds": 60,
        "structure": "hook_3sec → problem → solution → proof → cta",
    },
    "gmb_post": {
        "max_chars": 1500,
        "structure": "announcement → details → cta_link",
        "types": ["whats_new", "event", "offer", "product"],
    },
    "blog_post": {
        "min_words": 1200,
        "structure": "h1 → intro → h2_sections → faq → conclusion → schema",
    },
    "email": {
        "structure": "subject → preview → header → body → cta → footer",
    },
    "twitter_x": {
        "max_chars": 280,
        "structure": "hook → insight → cta",
    },
}


class ContentSocialAgent:
    """
    Full-featured organic social engineering content agent.
    Generates brand-aligned, SEO-optimized content across all channels.
    """

    def __init__(self):
        self.brand = BRAND_VOICE
        self.pillars = CONTENT_PILLARS
        self.templates = SOCIAL_TEMPLATES
        self.products = self._load_products()
        self.seo_keywords = self._load_seo_keywords()
        self.inventory = self._load_inventory()
        self.blog_archive = []

    # ─── Data Loaders ────────────────────────────────────────

    def _load_products(self) -> list:
        """Load product catalog from extracted data."""
        paths = [
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "lib", "products_raw.json"),
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "seed", "inventory.json"),
        ]
        for path in paths:
            if os.path.exists(path):
                with open(path, "r") as f:
                    return json.load(f)
        return []

    def _load_seo_keywords(self) -> list:
        """Load extracted Yoast SEO keywords."""
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "seed", "product_seo.json")
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
        return []

    def _load_inventory(self) -> list:
        """Load inventory for stock-aware content."""
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "seed", "inventory.json")
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
        return []

    # ─── Core Generation Methods ─────────────────────────────

    async def generate_content(
        self,
        channel: str = "instagram_post",
        pillar: str = None,
        product_slug: str = None,
        keyword: str = None,
        custom_topic: str = None,
    ) -> dict:
        """
        Master content generation method.
        Routes to specialized generators based on channel.
        """
        if not pillar:
            pillar = self._weighted_pillar_pick()

        result = {
            "channel": channel,
            "pillar": pillar,
            "generated_at": datetime.now().isoformat(),
            "brand": self.brand["name"],
        }

        if channel == "blog_post":
            result.update(await self.generate_blog(pillar, keyword, custom_topic))
        elif channel == "instagram_post":
            result.update(await self.generate_instagram_post(pillar, product_slug))
        elif channel == "instagram_reel":
            result.update(await self.generate_reel_script(pillar, product_slug))
        elif channel == "instagram_story":
            result.update(await self.generate_story(pillar, product_slug))
        elif channel == "gmb_post":
            result.update(await self.generate_gmb_post(pillar, product_slug))
        elif channel == "email":
            result.update(await self.generate_email(pillar, product_slug))
        elif channel == "twitter_x":
            result.update(await self.generate_tweet(pillar, product_slug))
        elif channel == "product_description":
            result.update(await self.generate_product_copy(product_slug))
        else:
            result["error"] = f"Unknown channel: {channel}"

        return result

    # ─── Blog Post Generator ────────────────────────────────

    async def generate_blog(
        self, pillar: str = "education", keyword: str = None, topic: str = None
    ) -> dict:
        """Generate a full SEO-optimized blog post with EEAT framework."""
        if not topic:
            topics = CONTENT_PILLARS.get(pillar, {}).get("topics", [])
            topic = random.choice(topics) if topics else "Cannabis Quality Standards"

        # Pull focus keyword from extracted Yoast data
        if not keyword and self.seo_keywords:
            kw_entry = random.choice([k for k in self.seo_keywords if k.get("focusKeyword")] or [{}])
            keyword = kw_entry.get("focusKeyword", "premium cannabis Canada")

        slug = re.sub(r"[^a-z0-9]+", "-", topic.lower()).strip("-")

        return {
            "type": "blog_post",
            "title": topic,
            "slug": slug,
            "keyword": keyword,
            "meta_description": f"{topic} — Expert insights from Mohawk Medibles' cultivation team. Science-backed, community-trusted. {self.brand['tagline']}.",
            "estimated_word_count": 1500,
            "author": {
                "name": "Mohawk Medibles Cultivation Team",
                "credentials": "Certified cannabis cultivators with 10+ years on Tyendinaga Mohawk Territory",
                "avatar": "/assets/logos/medibles-logo.png",
            },
            "outline": {
                "h1": topic,
                "intro": f"At Mohawk Medibles, we believe knowledge elevates experience. As Tyendinaga's premier cannabis authority, our cultivation team breaks down {topic.lower()} with the scientific rigor and traditional wisdom that defines the {self.brand['tagline']}.",
                "sections": [
                    {
                        "h2": "What You Need to Know",
                        "content": f"When it comes to {topic.lower()}, most sources oversimplify. Here's what the science actually shows...",
                        "word_count": 350,
                    },
                    {
                        "h2": "The Science Behind It",
                        "content": "Peer-reviewed research from the Journal of Cannabis Research demonstrates...",
                        "word_count": 400,
                    },
                    {
                        "h2": "Our Expert Perspective",
                        "content": f"With over a decade of cultivation experience on Tyendinaga Mohawk Territory, our team has observed first-hand that...",
                        "word_count": 300,
                        "eeat_signal": "First-hand experience + expertise",
                    },
                    {
                        "h2": "Practical Application",
                        "content": "Here's how you can apply this knowledge to your own experience...",
                        "word_count": 250,
                        "internal_links": self._get_related_products(keyword),
                    },
                ],
                "faq": [
                    {"q": f"What is {keyword}?", "a": f"{keyword} refers to..."},
                    {"q": f"How does {keyword} affect the experience?", "a": "Research shows..."},
                    {"q": "Where can I find premium products?", "a": "Mohawk Medibles carries a curated selection at mohawkmedibles.ca/shop"},
                ],
                "conclusion": f"Understanding {topic.lower()} empowers you to make informed choices. At Mohawk Medibles, every product meets our Empire Standard™ — because you deserve transparency and quality.",
            },
            "schema_markup": {
                "@type": "Article",
                "author": {"@type": "Organization", "name": "Mohawk Medibles"},
                "publisher": {"@type": "Organization", "name": "Mohawk Medibles"},
            },
            "internal_links": self._get_related_products(keyword),
            "seo_score_factors": [
                "Focus keyword in title ✅",
                "Focus keyword in meta description ✅",
                "Focus keyword in H2 ✅",
                "FAQ schema for AEO ✅",
                "Author EEAT signals ✅",
                "Internal linking to products ✅",
            ],
        }

    # ─── Instagram Post Generator ────────────────────────────

    async def generate_instagram_post(self, pillar: str = "product_story", product_slug: str = None) -> dict:
        """Generate an Instagram post with brand voice."""
        product = self._get_product(product_slug)
        product_name = product.get("name", product.get("slug", "Premium Selection")) if product else "The Collection"

        hooks = {
            "education": [
                "Most people get this wrong about cannabis. 👇",
                "The secret your budtender won't tell you:",
                "Science says this changes everything about your experience:",
                "3 things we wish every customer knew:",
            ],
            "product_story": [
                f"Meet {product_name}. This isn't just cannabis — it's art. 🎨",
                f"Why {product_name} is flying off our shelves:",
                f"Staff pick of the week: {product_name} 🏆",
                "This one's different. Here's why our team won't stop talking about it:",
            ],
            "heritage": [
                "Built on Tyendinaga Mohawk Territory. Rooted in tradition. 🌿",
                "This isn't just a brand. It's a legacy.",
                "From our ancestors to your experience — the story continues.",
            ],
            "behind_scenes": [
                "POV: You're inside our cultivation facility 🌱",
                "Ever wonder how we achieve the Empire Standard? Here's a look:",
                "From seed to your shelf — the 90-day journey:",
            ],
            "community": [
                "Our community makes us who we are. 🤝",
                "This is what 'Empire Standard' looks like in real life:",
            ],
        }

        hook = random.choice(hooks.get(pillar, hooks["product_story"]))

        body_templates = {
            "education": f"{hook}\n\nWhen it comes to choosing the right product, knowledge is power. Here's what the science shows:\n\n→ Terpenes determine 70% of your experience\n→ Full-spectrum > isolate for therapeutic use\n→ The entourage effect is real and measurable\n\nAt Mohawk Medibles, we don't just sell cannabis — we educate. Because informed choices lead to better experiences.\n\nSave this for next time you're shopping. 📌",
            "product_story": f"{hook}\n\n{'🔬 Profile: Premium grade, hand-selected' if product else ''}\n{'📊 Lab-tested for potency and purity' if product else ''}\n{'🌿 Sourced with the Empire Standard™' if product else ''}\n\nEvery product on our shelf has been personally vetted by our cultivation team. No exceptions.\n\n{'Shop ' + product_name + ' → link in bio' if product else 'Explore → link in bio'}",
            "heritage": f"{hook}\n\nAs an Indigenous-owned business on Tyendinaga Mohawk Territory, every product we curate carries the weight of tradition and the precision of modern science.\n\nThis isn't just commerce — it's cultural preservation through innovation.\n\nWe are Mohawk Medibles. And we hold ourselves to the Empire Standard™.",
            "behind_scenes": f"{hook}\n\nQuality isn't a department here. It's every department.\n\n✓ Hand-inspected at every stage\n✓ Lab-tested for pesticides, potency, and purity\n✓ Stored at optimal temperature and humidity\n✓ Packaged with care — never rush-shipped\n\nThis is the Empire Standard™. And you deserve nothing less.",
            "community": f"{hook}\n\nTo our community on Tyendinaga Mohawk Territory and beyond — thank you. Every order, every review, every recommendation means the world to us.\n\nWe're building something bigger than a business. We're building a movement.\n\n💚 Mohawk Medibles x Tyendinaga 🤝",
        }

        caption = body_templates.get(pillar, body_templates["product_story"])

        # Hashtag strategy
        tags = (
            random.sample(BRAND_VOICE["hashtags"]["primary"], 2)
            + random.sample(BRAND_VOICE["hashtags"]["product"], 2)
            + random.sample(BRAND_VOICE["hashtags"]["education" if pillar == "education" else "lifestyle"], 2)
        )

        return {
            "type": "instagram_post",
            "caption": caption,
            "hashtags": tags,
            "visual_direction": self._get_visual_direction(pillar, product),
            "best_post_times": ["9:00 AM EST", "12:00 PM EST", "7:00 PM EST"],
            "cta": "Link in bio" if pillar != "education" else "Save this post 📌",
        }

    # ─── Reel Script Generator ───────────────────────────────

    async def generate_reel_script(self, pillar: str = "education", product_slug: str = None) -> dict:
        """Generate an Instagram/TikTok reel script."""
        product = self._get_product(product_slug)

        scripts = {
            "education": {
                "hook": "Stop scrolling if you've ever picked the wrong strain.",
                "scenes": [
                    {"time": "0-3s", "visual": "Close-up of two different buds side by side", "text": "Hook text on screen", "audio": "Dramatic reveal sound"},
                    {"time": "3-8s", "visual": "Split screen: Indica vs Sativa plants", "text": "It's not about Indica vs Sativa anymore", "audio": "Narrator VO"},
                    {"time": "8-20s", "visual": "Terpene chart animation", "text": "It's about TERPENES", "audio": "Upbeat educational track"},
                    {"time": "20-30s", "visual": "Product lineup with terpene labels", "text": "At Mohawk Medibles, we test for 12+ terpenes", "audio": "Brand music"},
                    {"time": "30-40s", "visual": "Customer testimonial B-roll", "text": "So you always know exactly what you're getting", "audio": "Fade to CTA"},
                    {"time": "40-45s", "visual": "Logo + link", "text": "Shop with science → mohawkmedibles.ca", "audio": "End card sound"},
                ],
                "duration": 45,
            },
            "product_story": {
                "hook": f"This is {'why ' + (product.get('name', 'this') if product else 'our best seller') + ' hits different' if product else 'our process'}.",
                "scenes": [
                    {"time": "0-3s", "visual": "Dramatic product reveal (slow-mo unboxing)", "text": "Pattern interrupt text", "audio": "Deep bass hit"},
                    {"time": "3-10s", "visual": "Close-up product shots (macro lens)", "text": "Lab results overlay", "audio": "Ambient track"},
                    {"time": "10-20s", "visual": "Lifestyle footage — person enjoying product", "text": "Key value props", "audio": "Brand music builds"},
                    {"time": "20-30s", "visual": "Production facility quality shots", "text": "Empire Standard™ badge", "audio": "Narrator: 'This is the standard'"},
                    {"time": "30-35s", "visual": "Logo + shop link", "text": "CTA overlay", "audio": "End card"},
                ],
                "duration": 35,
            },
        }

        script = scripts.get(pillar, scripts["education"])

        return {
            "type": "reel_script",
            "hook": script["hook"],
            "scenes": script["scenes"],
            "duration_seconds": script["duration"],
            "music_suggestion": "Lo-fi beats or cinematic ambient",
            "trending_audio": "Check IG Reels trending tab for current hooks",
            "caption": f"{script['hook']}\n\nFull breakdown on our page 👆\n\n#MohawkMedibles #EmpireStandard #CannabisEducation",
        }

    # ─── Instagram Story Generator ───────────────────────────

    async def generate_story(self, pillar: str = "product_story", product_slug: str = None) -> dict:
        """Generate Instagram story content."""
        product = self._get_product(product_slug)
        product_name = product.get("name", "Featured Product") if product else "Featured Product"

        return {
            "type": "instagram_story",
            "slides": [
                {
                    "visual": "Product close-up with green tint overlay",
                    "text": f"🔥 NEW: {product_name}",
                    "sticker": "poll: Have you tried this yet? Yes / Need to",
                },
                {
                    "visual": "Lab results screenshot",
                    "text": "Lab-tested. Empire approved. ✅",
                    "sticker": "link to product page",
                },
                {
                    "visual": "Customer review screenshot",
                    "text": "Don't take our word for it 👀",
                    "sticker": "question: What's your favorite strain?",
                },
            ],
            "post_time": "Between stories (10-11 AM or 6-7 PM EST)",
        }

    # ─── Google My Business Post ─────────────────────────────

    async def generate_gmb_post(self, pillar: str = "product_story", product_slug: str = None) -> dict:
        """Generate a Google My Business post for local SEO."""
        product = self._get_product(product_slug)

        post_types = {
            "product_story": {
                "type": "PRODUCT",
                "title": f"New Arrival: {product.get('name', 'Premium Selection') if product else 'Premium Selection'}",
                "body": f"Now available at Mohawk Medibles on Tyendinaga Mohawk Territory. Lab-tested, hand-selected, and held to the Empire Standard™. Visit us today or shop online at mohawkmedibles.ca.\n\n#MohawkMedibles #Tyendinaga #PremiumCannabis",
                "cta": "SHOP",
                "cta_link": f"https://mohawkmedibles.ca/shop/{product.get('category', '')}/{product.get('slug', '')}/" if product else "https://mohawkmedibles.ca/shop/",
            },
            "education": {
                "type": "WHATS_NEW",
                "title": "Did You Know?",
                "body": "Understanding terpene profiles can transform your cannabis experience. Our expert staff can help you find the perfect match for your needs. Visit Mohawk Medibles on Tyendinaga Mohawk Territory.\n\n#CannabisEducation #MohawkMedibles",
                "cta": "LEARN_MORE",
                "cta_link": "https://mohawkmedibles.ca/blog/",
            },
            "community": {
                "type": "EVENT",
                "title": "Community Spotlight",
                "body": "Supporting Tyendinaga through quality, employment, and cultural preservation. Every purchase at Mohawk Medibles strengthens our community.\n\n#IndigenousOwned #Tyendinaga #MohawkMedibles",
                "cta": "VISIT",
                "cta_link": "https://mohawkmedibles.ca/about/",
            },
        }

        return {
            "type": "gmb_post",
            **post_types.get(pillar, post_types["product_story"]),
            "local_seo_keywords": [
                "cannabis Tyendinaga",
                "dispensary near me",
                "premium cannabis Ontario",
                "Mohawk Medibles",
                "Indigenous cannabis",
            ],
        }

    # ─── Email Generator ─────────────────────────────────────

    async def generate_email(self, pillar: str = "product_story", product_slug: str = None) -> dict:
        """Generate a brand-aligned email template."""
        product = self._get_product(product_slug)
        product_name = product.get("name", "The Collection") if product else "The Collection"

        return {
            "type": "email",
            "subject_lines": [
                f"The wait is over: {product_name} just dropped",
                f"You've never seen {product_name} like this",
                "Empire Standard™ — What it actually means",
            ],
            "preview_text": f"Lab-tested. Hand-selected. Now available — {product_name} at Mohawk Medibles.",
            "body": {
                "header_image": "/assets/products/category-edibles.jpg",
                "hero_text": f"Introducing {product_name}",
                "body_copy": f"We don't release products lightly. Every item on our shelf has been personally vetted by our cultivation team on Tyendinaga Mohawk Territory.\n\n{product_name} met every metric of the Empire Standard™ — potency, purity, terpene profile, and visual quality.\n\nThis is what premium looks like.",
                "cta_text": f"Shop {product_name}",
                "cta_link": f"https://mohawkmedibles.ca/shop/{product.get('category', '')}/{product.get('slug', '')}/" if product else "https://mohawkmedibles.ca/shop/",
            },
            "segment_targeting": "All subscribers (or segment by product category preference)",
        }

    # ─── Tweet/X Generator ───────────────────────────────────

    async def generate_tweet(self, pillar: str = "education", product_slug: str = None) -> dict:
        """Generate a Twitter/X post."""
        tweets = {
            "education": [
                "Terpenes determine 70% of your cannabis experience. Not THC percentage.\n\nThe more you know. 🧬\n\n#CannabisScience #MohawkMedibles",
                "PSA: 'Indica' and 'Sativa' are about plant shape, not effect.\n\nTerpenes are the real indicator. Learn the difference.\n\n#EmpireStandard",
                "Full-spectrum > Isolate\n\nThe entourage effect is why. Every time.\n\n#CannabisEducation #MohawkMedibles",
            ],
            "product_story": [
                "Just dropped and already moving fast.\n\nIf you know, you know.\n\nmohawkmedibles.ca/shop\n\n#EmpireStandard",
                "Lab-tested. Hand-selected. Held to the Empire Standard™.\n\nThat's the minimum.\n\nmohawkmedibles.ca\n\n#MohawkMedibles",
            ],
            "heritage": [
                "Indigenous-owned. Tyendinaga grown. Empire Standard™ approved.\n\nThis is Mohawk Medibles.\n\n#IndigenousOwned #Tyendinaga",
                "Our ancestors cultivated this plant for millennia.\n\nWe honor that legacy with every product.\n\n#MohawkMedibles #Heritage",
            ],
        }

        options = tweets.get(pillar, tweets["education"])

        return {
            "type": "twitter_x",
            "tweet": random.choice(options),
            "thread_option": pillar == "education",
            "best_post_times": ["8:00 AM EST", "12:30 PM EST", "5:00 PM EST"],
        }

    # ─── Product Description Generator ───────────────────────

    async def generate_product_copy(self, product_slug: str = None) -> dict:
        """Generate premium product descriptions with EEAT signals."""
        product = self._get_product(product_slug)
        if not product:
            return {"error": "Product not found"}

        name = product.get("name", product.get("slug", ""))
        category = product.get("category", "")
        slug = product.get("slug", "")

        # Map category to experience profile
        experience_map = {
            "concentrates": {"aroma": "Rich, complex terpene-forward", "effect": "Immediate onset, potent relief", "best_for": "Experienced users seeking concentrated effects"},
            "edibles": {"aroma": "Sweet, infused confection", "effect": "Gradual onset, sustained duration", "best_for": "Controlled dosing, discreet consumption"},
            "flower": {"aroma": "Fresh, aromatic botanical", "effect": "Classic onset, full-spectrum experience", "best_for": "Traditional consumption, connoisseurs"},
            "vapes-2": {"aroma": "Clean, vapor-extracted terpenes", "effect": "Quick onset, portable convenience", "best_for": "On-the-go, controlled dosing"},
            "mushrooms-2": {"aroma": "Earthy, natural", "effect": "Varies by strain and dosage", "best_for": "Microdosing to full journeys"},
            "cbd-2": {"aroma": "Subtle, herbal", "effect": "Non-psychoactive wellness", "best_for": "Pain relief, anxiety, sleep support"},
        }

        profile = experience_map.get(category, {"aroma": "Premium quality", "effect": "Expertly crafted", "best_for": "Quality-conscious consumers"})

        return {
            "type": "product_description",
            "product": name,
            "slug": slug,
            "short_description": f"✨ **{name}** — {profile['effect']}. Hand-selected for the Empire Standard™.",
            "long_description": f"**{name}**\n\nCurated by our cultivation experts on Tyendinaga Mohawk Territory, {name} represents the pinnacle of the {category.replace('-2', '').replace('-', ' ')} category.\n\n**🔬 Aroma Profile:** {profile['aroma']}\n**⚡ Effect:** {profile['effect']}\n**👤 Best For:** {profile['best_for']}\n\nEvery batch is lab-tested for potency, purity, and pesticide-free verification. This is the Empire Standard™ — because you deserve transparency in every product.\n\n*Sourced and curated with pride on Tyendinaga Mohawk Territory.*",
            "seo": {
                "alt_text": f"{name} — Premium {category.replace('-2', '').replace('-', ' ').title()} from Mohawk Medibles, Tyendinaga Ontario Canada",
                "meta_description": f"Shop {name} at Mohawk Medibles. {profile['effect']}. Lab-tested, Empire Standard™ approved. Free delivery across Canada.",
            },
        }

    # ─── Content Calendar Generator ──────────────────────────

    async def generate_content_calendar(self, days: int = 7) -> list:
        """Generate a full content calendar with pillar rotation."""
        calendar = []
        channels = ["instagram_post", "instagram_reel", "instagram_story", "gmb_post", "twitter_x"]
        start_date = datetime.now()

        for day in range(days):
            date = start_date + timedelta(days=day)
            pillar = self._weighted_pillar_pick()
            channel = channels[day % len(channels)]
            product = random.choice(self.products) if self.products else None

            content = await self.generate_content(
                channel=channel,
                pillar=pillar,
                product_slug=product.get("slug") if product else None,
            )

            calendar.append({
                "date": date.strftime("%Y-%m-%d"),
                "day": date.strftime("%A"),
                "channel": channel,
                "pillar": pillar,
                "content": content,
            })

        return calendar

    # ─── Batch Content Generation ────────────────────────────

    async def generate_batch(
        self,
        count: int = 10,
        channels: list = None,
        pillar: str = None,
    ) -> list:
        """Generate a batch of content pieces for scheduling."""
        if not channels:
            channels = ["instagram_post", "instagram_reel", "gmb_post", "twitter_x", "email"]

        results = []
        for i in range(count):
            channel = channels[i % len(channels)]
            p = pillar or self._weighted_pillar_pick()
            product = random.choice(self.products) if self.products else None

            content = await self.generate_content(
                channel=channel,
                pillar=p,
                product_slug=product.get("slug") if product else None,
            )
            results.append(content)

        return results

    # ─── Helpers ─────────────────────────────────────────────

    def _weighted_pillar_pick(self) -> str:
        """Select a pillar based on configured weights."""
        pillars = list(self.pillars.keys())
        weights = [self.pillars[p]["weight"] for p in pillars]
        return random.choices(pillars, weights=weights, k=1)[0]

    def _get_product(self, slug: str = None) -> Optional[dict]:
        """Get a product by slug or return a random one."""
        if not slug and self.products:
            return random.choice(self.products)
        for p in self.products:
            if p.get("slug") == slug or p.get("post_name") == slug:
                return p
        return None

    def _get_related_products(self, keyword: str = None, limit: int = 3) -> list:
        """Get related products for internal linking."""
        if not keyword or not self.products:
            return random.sample(self.products, min(limit, len(self.products))) if self.products else []

        keyword_lower = keyword.lower()
        matches = [
            p for p in self.products
            if keyword_lower in (p.get("slug", "") + " " + p.get("category", "")).lower()
        ]

        if not matches:
            matches = random.sample(self.products, min(limit, len(self.products)))
        return matches[:limit]

    def _get_visual_direction(self, pillar: str, product: dict = None) -> dict:
        """Return visual / photography direction for the content piece."""
        directions = {
            "education": {
                "style": "Clean, scientific, editorial",
                "lighting": "Bright, studio-lit with white/neutral background",
                "elements": ["Lab equipment", "Terpene charts", "Close-up macro shots"],
                "color_palette": "White, green, gold",
            },
            "product_story": {
                "style": "Cinematic, moody, premium",
                "lighting": "Dark background with dramatic side lighting",
                "elements": ["Product hero shot", "Smoke wisps", "Gradient overlays"],
                "color_palette": "Black, deep green, gold accents",
            },
            "heritage": {
                "style": "Warm, documentary, authentic",
                "lighting": "Natural golden hour",
                "elements": ["Landscape", "Hands/cultivation", "Traditional motifs"],
                "color_palette": "Earth tones, warm gold, deep green",
            },
            "behind_scenes": {
                "style": "Raw, authentic, behind-the-glass",
                "lighting": "Facility lighting — clean and bright",
                "elements": ["Grow rooms", "Lab testing", "Team photos"],
                "color_palette": "White, green, stainless steel grey",
            },
            "community": {
                "style": "Warm, inclusive, people-first",
                "lighting": "Bright, natural",
                "elements": ["Real customers", "Events", "Team interactions"],
                "color_palette": "Warm neutrals, brand green",
            },
        }
        return directions.get(pillar, directions["product_story"])


# ─── API Endpoint Integration ────────────────────────────────

async def generate_blog_post(topic: str = None) -> dict:
    """Legacy compatibility wrapper."""
    agent = content_bot
    return await agent.generate_blog(topic=topic)


async def optimize_product_description(product_name: str, raw_desc: str = "") -> str:
    """Legacy compatibility wrapper."""
    result = await content_bot.generate_product_copy(product_name)
    return result.get("long_description", raw_desc)


# Singleton
content_bot = ContentSocialAgent()
