import { buildBreadcrumbSchema } from '@/lib/discovery';
import { JsonLd } from './JsonLd';
import { TrackedLink } from '@/components/cerebro/TrackedLink';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schema = buildBreadcrumbSchema(items);

  return (
    <>
      <JsonLd schema={schema} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <span key={item.href} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === items.length - 1 ? (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            ) : (
              <TrackedLink href={item.href} analyticsEvent="breadcrumb_click" analyticsCategory="breadcrumbs" analyticsLabel={item.label} className="hover:text-foreground transition-colors">
                {item.label}
              </TrackedLink>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
