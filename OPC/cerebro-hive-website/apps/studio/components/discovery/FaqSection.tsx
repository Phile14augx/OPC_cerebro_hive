'use client';

import { useState } from 'react';
import { buildFaqSchema } from '@/lib/discovery';
import { JsonLd } from './JsonLd';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
  title?: string;
  className?: string;
}

export function FaqSection({ faqs, title = 'Frequently Asked Questions', className }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const schema = buildFaqSchema(faqs);

  return (
    <>
      <JsonLd schema={schema} />
      <section className={className}>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                className="w-full text-left px-5 py-4 font-medium flex justify-between items-center hover:bg-muted/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span>{faq.q}</span>
                <span className="ml-4 shrink-0 text-muted-foreground">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
