import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Calendar, User, ChevronRight, BookOpen } from "lucide-react";
import { JsonLd } from "@/components/discovery";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/discovery";
import { guides, getGuideBySlug } from "@/lib/content/guides";

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide Not Found" };

  return {
    title: `${guide.title} | CerebroHive`,
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: `https://cerebropchive.org/resources/guides/${guide.slug}` },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const articleSchema = buildArticleSchema({
    title: guide.title,
    description: guide.description,
    slug: guide.slug,
    urlPath: `/resources/guides/${guide.slug}`,
    datePublished: guide.publishDate,
    dateModified: guide.lastUpdated,
    author: guide.author,
    section: "Enterprise AI Guides",
    keywords: guide.keywords,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://cerebropchive.org" },
    { name: "Resources", url: "https://cerebropchive.org/resources" },
    { name: "Guides", url: "https://cerebropchive.org/resources/guides" },
    { name: guide.title, url: `https://cerebropchive.org/resources/guides/${guide.slug}` },
  ]);

  return (
    <>
      <JsonLd schema={articleSchema} />
      <JsonLd schema={breadcrumbSchema} />

      <div className="bg-background min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b border-border">
          <div className="container-wide py-4">
            <nav className="flex items-center gap-2 text-xs text-text-muted">
              <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
              <ChevronRight size={12} />
              <Link href="/resources" className="hover:text-text-primary transition-colors">Resources</Link>
              <ChevronRight size={12} />
              <span className="text-text-secondary truncate max-w-[200px]">{guide.title}</span>
            </nav>
          </div>
        </div>

        <div className="container-wide py-16 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">
            {/* Main content */}
            <article>
              {/* Header */}
              <header className="mb-12 pb-10 border-b border-border">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-accent/10 border border-primary-accent/20 mb-6">
                  <BookOpen size={12} className="text-primary-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent">Enterprise Guide</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-4">
                  {guide.title}
                </h1>
                <p className="text-xl text-text-secondary leading-relaxed mb-8">{guide.subtitle}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{guide.author}</span>
                    <span className="text-text-muted/50">·</span>
                    <span className="text-text-muted">{guide.authorRole}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Updated {new Date(guide.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{guide.readingTimeMinutes} min read</span>
                  </div>
                </div>
              </header>

              {/* Sections */}
              <div className="prose-guide">
                {guide.sections.map((section) => (
                  <section key={section.id} id={section.id} className="mb-16">
                    <h2 className="text-2xl font-space font-bold text-text-primary mb-8 pb-3 border-b border-border">
                      {section.title}
                    </h2>
                    {section.subsections.map((sub, i) => (
                      <div key={i} className="mb-10">
                        <h3 className="text-lg font-space font-bold text-text-primary mb-4">
                          {sub.title}
                        </h3>
                        <div className="space-y-4">
                          {sub.content.split("\n\n").map((paragraph, j) => (
                            <p key={j} className="text-text-secondary leading-relaxed text-[15px]">
                              {paragraph.trim()}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="mt-16 pt-10 border-t border-border">
                <div className="p-8 rounded-2xl bg-surface border border-border">
                  <h3 className="text-xl font-space font-bold text-text-primary mb-3">Ready to Implement?</h3>
                  <p className="text-text-secondary mb-6 text-sm">
                    CerebroHive architects can help you apply this framework to your specific enterprise context — from readiness assessment to platform deployment.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-accent text-background font-space font-bold text-sm rounded-xl hover:-translate-y-0.5 transition-transform"
                    >
                      Talk to an Architect <ChevronRight size={16} />
                    </Link>
                    <Link
                      href="/resources"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-primary font-space font-bold text-sm rounded-xl hover:border-primary-accent/40 transition-colors"
                    >
                      More Guides
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <div className="p-6 rounded-2xl bg-surface border border-border">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">In This Guide</h4>
                  <nav className="flex flex-col gap-1">
                    {guide.sections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="group flex items-start gap-2 py-2 px-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-background transition-all"
                      >
                        <span className="w-1 h-1 rounded-full bg-border group-hover:bg-primary-accent mt-2 shrink-0 transition-colors" />
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>

                <div className="mt-4 p-6 rounded-2xl bg-surface border border-border">
                  <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Quick Facts</div>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Read time</span>
                      <span className="text-text-primary font-mono">{guide.readingTimeMinutes}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Sections</span>
                      <span className="text-text-primary font-mono">{guide.sections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Author</span>
                      <span className="text-text-primary">{guide.author.split(" ").slice(-1)[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
