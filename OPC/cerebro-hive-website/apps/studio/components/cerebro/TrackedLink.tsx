import React from 'react';
import Link, { LinkProps } from 'next/link';

export interface TrackedLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  analyticsEvent: string;
  analyticsCategory?: string;
  analyticsLabel?: string;
  children: React.ReactNode;
}

/**
 * Enterprise-grade Tracked Link
 * Enforces analytics event tracking on every internal and external link click.
 * Use this instead of next/link or <a> elements.
 */
export const TrackedLink = React.forwardRef<HTMLAnchorElement, TrackedLinkProps>(
  ({ analyticsEvent, analyticsCategory = 'navigation', analyticsLabel, onClick, children, href, ...props }, ref) => {
    
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Stub for real enterprise analytics
      if (typeof window !== 'undefined') {
        console.log(`[Analytics Tracked] Event: ${analyticsEvent}`, {
          category: analyticsCategory,
          label: analyticsLabel || (typeof children === 'string' ? children : 'link'),
          destination: href,
          timestamp: new Date().toISOString()
        });
      }

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Link href={href} ref={ref} onClick={handleClick} {...props}>
        {children}
      </Link>
    );
  }
);
TrackedLink.displayName = 'TrackedLink';
