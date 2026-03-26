"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, Search, X } from "lucide-react";
import { getAllBlogPosts, getAllBlogCategories, searchBlogPosts } from "@/data/blog/posts";
import { Button } from "@/components/ui/button";

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
    const allPosts = getAllBlogPosts();
    const categories = getAllBlogCategories();

    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

    const filteredPosts = useMemo(() => {
        let result = searchQuery ? searchBlogPosts(searchQuery) : allPosts;
        if (activeCategory !== "All") {
            result = result.filter((p) => p.category === activeCategory);
        }
        return result;
    }, [allPosts, activeCategory, searchQuery]);

    const featured = filteredPosts[0];
    const gridPosts = filteredPosts.slice(1, visibleCount + 1);
    const hasMore = visibleCount + 1 < filteredPosts.length;

    function handleCategoryChange(cat: string) {
        setActiveCategory(cat);
        setVisibleCount(POSTS_PER_PAGE);
    }

    function handleSearchChange(val: string) {
        setSearchQuery(val);
        setVisibleCount(POSTS_PER_PAGE);
    }

    return (
        <main className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            <div className="container mx-auto px-6">
                {/* Header */}
                <header className="max-w-4xl mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground mb-4 uppercase font-heading">
                        The Journal.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Cannabis science, dosing guides, and product education from our team
                        on Tyendinaga Mohawk Territory.
                    </p>
                </header>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md" role="search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <label htmlFor="blog-search" className="sr-only">Search articles</label>
                        <input
                            id="blog-search"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search articles..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 backdrop-blur-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => handleSearchChange("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => handleCategoryChange("All")}
                            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                                activeCategory === "All"
                                    ? "bg-secondary text-forest"
                                    : "bg-card text-muted-foreground hover:bg-muted border border-border"
                            }`}
                        >
                            All ({allPosts.length})
                        </button>
                        {categories.map((cat) => {
                            const count = allPosts.filter((p) => p.category === cat).length;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                                        activeCategory === cat
                                            ? "bg-secondary text-forest"
                                            : "bg-card text-muted-foreground hover:bg-muted border border-border"
                                    }`}
                                >
                                    {cat} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Results count */}
                {searchQuery && (
                    <div className="text-sm text-muted-foreground mb-6" aria-live="polite">
                        {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""} found
                        for &ldquo;{searchQuery}&rdquo;
                    </div>
                )}

                {/* No Results */}
                {filteredPosts.length === 0 && (
                    <div className="text-center py-20">
                        <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-foreground mb-2">No articles found</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Try a different search term or browse a category.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-foreground"
                            onClick={() => { handleSearchChange(""); handleCategoryChange("All"); }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}

                {/* Featured Post */}
                {featured && (
                    <Link
                        href={`/blog/${featured.slug}`}
                        className="group block mb-12"
                    >
                        <article className="relative rounded-3xl overflow-hidden border border-border hover:border-secondary/40 transition-all duration-500">
                            <div className="grid md:grid-cols-2">
                                <div className="relative h-64 md:h-[420px]">
                                    <Image
                                        src={featured.image}
                                        alt={featured.imageAlt}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-forest/80 md:block hidden" />
                                </div>
                                <div className="p-8 md:p-12 flex flex-col justify-center glass-card">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[10px] font-bold tracking-widest uppercase bg-secondary/20 text-forest dark:text-lime px-3 py-1 rounded-full">
                                            {featured.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {featured.readTime}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight group-hover:text-secondary transition-colors">
                                        {featured.title}
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                                        {featured.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-forest dark:text-lime font-bold text-sm group-hover:gap-4 transition-all">
                                        Read Article <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Link>
                )}

                {/* Post Grid */}
                {gridPosts.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {gridPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group"
                            >
                                <article className="rounded-2xl overflow-hidden border border-border hover:border-secondary/40 transition-all duration-500 h-full flex flex-col glass-card">
                                    <div className="relative h-52">
                                        <Image
                                            src={post.image}
                                            alt={post.imageAlt}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                                        <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase bg-white/15 backdrop-blur-md text-white px-3 py-1 rounded-full border border-border">
                                            {post.category}
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(post.datePublished).toLocaleDateString("en-CA", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {post.readTime}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mb-3 leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                                            {post.excerpt}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex gap-1.5 flex-wrap mt-3 mb-3">
                                            {post.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 text-forest dark:text-lime font-bold text-xs group-hover:gap-3 transition-all uppercase tracking-wider">
                                            Read More <ArrowRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Load More */}
                {hasMore && (
                    <div className="text-center mt-12">
                        <Button
                            variant="outline"
                            size="lg"
                            className="gap-2 px-8 border-border text-foreground hover:bg-muted"
                            onClick={() => setVisibleCount((prev) => prev + POSTS_PER_PAGE)}
                        >
                            Load More Articles
                            <span className="text-xs text-muted-foreground">
                                ({filteredPosts.length - visibleCount - 1} remaining)
                            </span>

                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
