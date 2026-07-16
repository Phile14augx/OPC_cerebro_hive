import React from 'react';

export interface TrackedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  analyticsEvent: string;
  analyticsCategory?: string;
  analyticsLabel?: string;
}

/**
 * Enterprise-grade Tracked Button
 * Enforces analytics event tracking on every click.
 * Use this instead of native <button> elements.
 */
export const TrackedButton = React.forwardRef<HTMLButtonElement, TrackedButtonProps>(
  ({ analyticsEvent, analyticsCategory = 'interaction', analyticsLabel, onClick, children, ...props }, ref) => {
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Stub for real enterprise analytics (e.g., PostHog, Segment, Google Analytics)
      if (typeof window !== 'undefined') {
        console.log(`[Analytics Tracked] Event: ${analyticsEvent}`, {
          category: analyticsCategory,
          label: analyticsLabel || (typeof children === 'string' ? children : 'button'),
          timestamp: new Date().toISOString()
        });
      }

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button ref={ref} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);
TrackedButton.displayName = 'TrackedButton';
