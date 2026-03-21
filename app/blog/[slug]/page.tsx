import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import { getAllBlogPosts, getBlogPost } from "@/data/blog/posts";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schemas";

// ─── Static Params for SSG ──────────────────────────────────
export function generateStaticParams() {
    return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

// ─── Dynamic Metadata ───────────────────────────────────────
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) return { title: "Post Not Found" };

    const ogImageUrl = `https://mohawkmedibles.ca/blog/${slug}/opengraph-image`;

    return {
        title: post.title,
        description: post.metaDescription,
        keywords: post.tags,
        openGraph: {
            title: `${post.title} | Mohawk Medibles`,
            description: post.metaDescription,
            url: `https://mohawkmedibles.ca/blog/${slug}`,
            type: "article",
            publishedTime: post.datePublished,
            modifiedTime: post.dateModified,
            authors: [post.author],
            section: post.category,
            tags: post.tags,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${post.title} — ${post.category} article from Mohawk Medibles Blog`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.metaDescription,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${post.title} — ${post.category} article from Mohawk Medibles Blog`,
                },
            ],
        },
        alternates: {
            canonical: `https://mohawkmedibles.ca/blog/${slug}`,
        },
    };
}

// ─── Blog Post Page ──────────────────────────────────────────
export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) notFound();

    // JSON-LD schemas — content is static/trusted (from our own data/blog/posts.ts)
    const articleJsonLd = articleSchema({
        title: post.title,
        slug: post.slug,
        description: post.metaDescription,
        datePublished: post.datePublished,
        dateModified: post.dateModified,
        image: post.image.startsWith("http")
            ? post.image
            : `https://mohawkmedibles.ca${post.image}`,
        authorName: post.author,
        authorCredentials: post.authorCredentials,
        keywords: post.tags,
        wordCount: post.content.split(/\s+/).length,
    });

    const breadcrumbJsonLd = breadcrumbSchema([
        { name: "Home", url: "https://mohawkmedibles.ca" },
        { name: "Blog", url: "https://mohawkmedibles.ca/blog" },
        { name: post.title, url: `https://mohawkmedibles.ca/blog/${slug}` },
    ]);

    // Get related posts (same category, excluding current)
    const allPosts = getAllBlogPosts();
    const related = allPosts
        .filter((p) => p.slug !== slug)
        .sort((a, b) => {
            const aMatch = a.category === post.category ? 1 : 0;
            const bMatch = b.category === post.category ? 1 : 0;
            return bMatch - aMatch;
        })
        .slice(0, 3);

    // Render markdown-ish content (static trusted content from our data files)
    const contentLines = post.content.split("\n");

    return (
        <>
            {/* JSON-LD injection — trusted static content from data/blog/posts.ts, not user input */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <main className="min-h-screen pt-32 pb-20 page-glass text-foreground">
                <article className="container mx-auto px-6">
                    {/* Back Link */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest dark:hover:text-lime transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Blog
                    </Link>

                    {/* Hero Image */}
                    <div className="relative h-64 md:h-[480px] rounded-3xl overflow-hidden mb-10">
                        <Image
                            src={post.image}
                            alt={post.imageAlt}
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/30 to-transparent" />
                        <div className="absolute bottom-4 right-4 pointer-events-none">
                            <Image
                                src="/assets/logos/medibles-logo2.png"
                                alt=""
                                width={32}
                                height={32}
                                className="opacity-[0.2] select-none"
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    {/* Post Header */}
                    <header className="max-w-3xl mx-auto mb-12">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="text-[10px] font-bold tracking-widest uppercase bg-secondary/20 text-forest dark:text-lime px-3 py-1 rounded-full">
                                {post.category}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {post.readTime} read
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {new Date(post.datePublished).toLocaleDateString("en-CA", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
                            {post.title}
                        </h1>

                        <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-secondary/30 pl-6">
                            {post.excerpt}
                        </p>

                        <div className="mt-8 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                                <span className="text-forest dark:text-lime font-bold text-sm">MM</span>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-foreground">{post.author}</div>
                                <div className="text-xs text-muted-foreground">{post.authorCredentials}</div>
                            </div>
                        </div>
                    </header>

                    {/* Post Content */}
                    <div className="max-w-3xl mx-auto">
                        <div className="space-y-1">
                            {contentLines.map((line, i) => {
                                if (line.startsWith("### "))
                                    return (
                                        <h3 key={i} className="text-xl font-bold text-foreground mt-8 mb-3">
                                            {line.slice(4)}
                                        </h3>
                                    );
                                if (line.startsWith("## "))
                                    return (
                                        <h2 key={i} className="text-2xl font-bold text-forest dark:text-lime mt-12 mb-4">
                                            {line.slice(3)}
                                        </h2>
                                    );
                                if (line.startsWith("> "))
                                    return (
                                        <blockquote
                                            key={i}
                                            className="border-l-4 border-secondary/50 pl-4 py-1 my-4 text-muted-foreground italic"
                                        >
                                            {line.slice(2)}
                                        </blockquote>
                                    );
                                if (line.startsWith("| ") && line.includes("|")) {
                                    const cells = line.split("|").filter((c) => c.trim()).map((c) => c.trim());
                                    if (cells.every((c) => /^[-:]+$/.test(c))) return null;
                                    return (
                                        <div key={i} className="flex gap-4 py-2 border-b border-border text-sm text-muted-foreground overflow-x-auto">
                                            {cells.map((cell, j) => (
                                                <span key={j} className="flex-1 min-w-[80px]">
                                                    <InlineText text={cell} />
                                                </span>
                                            ))}
                                        </div>
                                    );
                                }
                                if (line.startsWith("- "))
                                    return (
                                        <li key={i} className="text-muted-foreground leading-relaxed ml-4 list-disc">
                                            <InlineText text={line.slice(2)} />
                                        </li>
                                    );
                                if (line.trim() === "") return <div key={i} className="h-2" />;
                                return (
                                    <p key={i} className="text-muted-foreground leading-relaxed">
                                        <InlineText text={line} />
                                    </p>
                                );
                            })}
                        </div>

                        {/* Tags */}
                        <div className="mt-16 pt-8 border-t border-border">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-12 glass-card rounded-2xl p-8 border border-secondary/20 text-center">
                            <h3 className="text-xl font-bold text-foreground mb-2">Ready to explore?</h3>
                            <p className="text-muted-foreground mb-6">Browse 344+ premium, lab-tested cannabis products.</p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-secondary text-white font-bold px-8 py-3 rounded-full hover:bg-secondary/80 transition-colors"
                            >
                                Shop the Collection
                            </Link>
                        </div>
                    </div>

                    {/* Related Posts */}
                    {related.length > 0 && (
                        <section className="max-w-5xl mx-auto mt-20">
                            <h2 className="text-2xl font-bold text-foreground mb-8">Continue Reading</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {related.map((r) => (
                                    <Link
                                        key={r.slug}
                                        href={`/blog/${r.slug}`}
                                        className="group rounded-xl overflow-hidden border border-border hover:border-secondary/30 transition-all"
                                    >
                                        <div className="relative h-40">
                                            <Image
                                                src={r.image}
                                                alt={r.imageAlt}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                                        </div>
                                        <div className="p-4">
                                            <span className="text-[10px] font-bold tracking-widest uppercase text-forest dark:text-lime">
                                                {r.category}
                                            </span>
                                            <h3 className="text-sm font-bold text-foreground mt-1 line-clamp-2 group-hover:text-secondary transition-colors">
                                                {r.title}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </article>
            </main>
        </>
    );
}

// ─── Inline text renderer (bold + links) ──────────────────────
function InlineText({ text }: { text: string }) {
    // Split on bold (**text**) and markdown links ([text](url))
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                        <strong key={i} className="text-foreground font-semibold">
                            {part.slice(2, -2)}
                        </strong>
                    );
                }
                const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                if (linkMatch) {
                    return (
                        <Link key={i} href={linkMatch[2]} className="text-forest dark:text-lime hover:text-forest/80 dark:hover:text-lime/80 underline underline-offset-2 transition-colors">
                            {linkMatch[1]}
                        </Link>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}
