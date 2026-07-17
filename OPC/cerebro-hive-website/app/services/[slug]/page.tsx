import { services } from "@/lib/data/services";
import { Metadata } from 'next';
import { notFound } from "next/navigation";
import React from 'react';
import { ServiceRenderer } from "@/components/services/renderer/ServiceRenderer";

export async function generateStaticParams() {
  return services.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find(s => s.slug === slug);
  if (!service) return { title: 'Service Not Found' };
  
  return {
    title: `${service.title} | CerebroHive Enterprise Services`,
    description: service.summary,
    openGraph: {
      title: `${service.title} | CerebroHive`,
      description: service.summary,
      type: "website",
    }
  };
}

export default async function EnterpriseServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find(s => s.slug === slug);

  if (!service) {
    notFound();
  }

  // Generate structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": service.title,
    "description": service.summary,
    "url": `https://cerebrohive.com/services/${service.slug}`,
    "provider": {
      "@type": "Organization",
      "name": "CerebroHive OPC Pvt. Ltd."
    },
    "areaServed": service.industries.map(ind => ({
      "@type": "Concept",
      "name": ind
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceRenderer service={service} />
    </>
  );
}
