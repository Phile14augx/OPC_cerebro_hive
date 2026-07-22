import { services } from "@/lib/data/services";
import { Metadata } from 'next';
import { notFound } from "next/navigation";
import React from 'react';
import { ServiceRenderer } from "@/components/services/renderer/ServiceRenderer";
import { JsonLd } from "@/components/discovery";
import { buildServiceSchema, buildFaqSchema, buildBreadcrumbSchema } from "@/lib/discovery";
import { buildServiceMetadata } from "@/lib/discovery/metadata";

export async function generateStaticParams() {
  return services.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find(s => s.slug === slug);
  if (!service) return { title: 'Service Not Found' };

  return buildServiceMetadata({
    title: service.seo?.title ?? `${service.title} | Enterprise AI Services`,
    description: service.seo?.description ?? service.summary,
    slug: service.slug,
    keywords: service.seo?.keywords,
  });
}

export default async function EnterpriseServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find(s => s.slug === slug);

  if (!service) {
    notFound();
  }

  const schemas = [
    buildServiceSchema({
      name: service.title,
      description: service.summary,
      serviceType: service.category,
      slug: service.slug,
    }),
    buildBreadcrumbSchema([
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: service.title, href: `/services/${service.slug}` },
    ]),
    ...(service.faqs && service.faqs.length > 0
      ? [buildFaqSchema(service.faqs.map(f => ({ q: f.question, a: f.answer })))]
      : []),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <JsonLd key={i} schema={schema} />
      ))}
      <ServiceRenderer service={service} />
    </>
  );
}
