import React from "react";

export const getAccessibilityProps = (
  decorative?: boolean,
  label?: string,
  description?: string
): React.SVGProps<SVGSVGElement> => {
  const isDecorative = decorative !== false && !label;
  
  if (isDecorative) {
    return {
      role: "presentation",
      "aria-hidden": "true",
      focusable: "false",
    };
  }

  return {
    role: "img",
    "aria-label": label,
    focusable: "false",
  };
};
