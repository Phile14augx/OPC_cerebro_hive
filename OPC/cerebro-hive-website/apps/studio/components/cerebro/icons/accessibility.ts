import React from "react";

export const getAccessibilityProps = (
  decorative?: boolean,
  label?: string,
  description?: string,
): React.SVGProps<SVGSVGElement> => {
  const isDecorative = decorative !== false && !label && !description;
  
  if (isDecorative) {
    return {
      role: "presentation",
      "aria-hidden": "true",
      focusable: "false",
    };
  }

  return {
    role: "img",
    "aria-label": [label, description].filter(Boolean).join(": "),
    focusable: "false",
  };
};
