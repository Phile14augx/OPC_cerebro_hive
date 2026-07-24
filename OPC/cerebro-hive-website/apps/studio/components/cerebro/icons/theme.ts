import { IconColors, resolveColorToken } from "./colorMap";
import { MotionTokens, createTransition } from "./motionTokens";
import { getAccessibilityProps } from "./accessibility";
import { sizeMap, defaultStrokeWidth } from "./tokens";

export const IconTheme = {
  colors: IconColors,
  resolveColor: resolveColorToken,
  motion: MotionTokens,
  createTransition,
  accessibility: getAccessibilityProps,
  sizes: sizeMap,
  defaultStrokeWidth,
};
