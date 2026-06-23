import sanitizeHtml from "sanitize-html";

/**
 * Sanitize rich product-description HTML before it is rendered via
 * dangerouslySetInnerHTML. Allowlist-based (sanitize-html): only safe formatting
 * tags/attributes survive; <script>/<style>/<iframe>/<svg>/<object>/<embed>,
 * event handlers (on*), and javascript:/data: URLs are stripped.
 *
 * Use at the DATA BOUNDARY (server) — never trust HTML coming from WooCommerce,
 * the sync jobs, or admin input. Sanitizing at the product page render also
 * cleans any unsafe HTML already stored in the DB from before this guard.
 */
export function sanitizeProductHtml(html: string | null | undefined): string {
    if (!html) return "";
    return sanitizeHtml(html, {
        allowedTags: [
            "p", "br", "hr", "span", "div",
            "strong", "b", "em", "i", "u", "s", "small", "sub", "sup",
            "ul", "ol", "li",
            "h2", "h3", "h4", "h5", "h6",
            "blockquote", "a",
            "table", "thead", "tbody", "tr", "th", "td",
        ],
        allowedAttributes: {
            a: ["href", "title", "target", "rel"],
            "*": ["class"],
        },
        allowedSchemes: ["http", "https", "mailto", "tel"],
        allowProtocolRelative: false,
        // Drop tabnabbing / referrer leakage on any surviving links.
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }, true),
        },
        disallowedTagsMode: "discard",
    });
}
