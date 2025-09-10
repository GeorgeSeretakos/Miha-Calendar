"use client";

import { useEffect, useState, useMemo } from "react";
import * as blogData from "../../../public/data/blog";
import BlogCard from "../components/blog/BlogCard";
import NewsletterModal from "../components/NewsletterModal";

export default function BlogPage() {
  const [locale, setLocale] = useState("el");
  const [category, setCategory] = useState("news"); // keep stable keys: "news" | "studies"

  useEffect(() => {
    const saved = localStorage.getItem("locale") || "el";
    setLocale(saved);
  }, []);

  // Resolve posts from data file in a flexible way:
  // - Prefer posts_en / posts_el if present
  // - Fallback to default export or `posts`
  const posts = useMemo(() => {
    const fallback =
      blogData.default || blogData.posts || []; // backward compatibility
    if (locale === "en") return blogData.posts_en || fallback;
    return blogData.posts_el || fallback;
  }, [locale]);

  const tabs =
    locale === "en"
      ? [
        { value: "news", label: "News" },
        { value: "studies", label: "Studies" },
      ]
      : [
        { value: "news", label: "Νέα" },
        { value: "studies", label: "Μελέτες" },
      ];

  const filteredPosts = posts.filter((p) => p?.category === category);

  return (
    <main>
      <NewsletterModal/>
      {/* Tabs */}
      <div className="w-full bg-[#1C86D1] shadow-sm">
        <nav className="flex max-w-7xl mx-auto gap-6 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategory(tab.value)}
              className={`px-2 border-b-2 transition cursor-pointer ${
                category === tab.value
                  ? "border-white text-white font-medium"
                  : "border-transparent hover:border-white text-white"
              }`}
              aria-current={category === tab.value ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Grid */}
      <section className="py-12 max-w-6xl mx-auto px-4">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-600">
            {locale === "en"
              ? "No posts in this category yet."
              : "Δεν υπάρχουν δημοσιεύσεις σε αυτή την κατηγορία."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <div key={post.slug || post.pdfUrl || post.title}>
                {/* Pass locale so BlogCard can pick the right language fields if it supports them */}
                <BlogCard post={post} locale={locale} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}