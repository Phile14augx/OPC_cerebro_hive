import React from 'react';
import { analytics } from "@/lib/analytics/AnalyticsAdapter";

export interface TrackedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  eventCategory: string;
  eventLabel: string;
  eventAction?: string;
}

/**
 * A wrapper around native button that automatically sends analytics events.
 * Use this instead of native <button> elements.
 */
export const TrackedButton = React.forwardRef<HTMLButtonElement, TrackedButtonProps>(
  ({ eventCategory, eventLabel, eventAction = "click", onClick, children, ...props }, ref) => {
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // 1. Send Analytics Event
      analytics.track({
        eventName: eventAction,
        category: eventCategory,
        label: eventLabel
      });

      // 2. Call original onClick if provided
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
