/* Category glyphs — plain module (no components) so fast-refresh stays happy. */
import type { ComponentType } from "react";
import { Coins, Flower2, HeartHandshake, HeartPulse, Scale, TrendingUp } from "lucide-react";
import type { ProblemCategoryId } from "./types";

export type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export const CATEGORY_ICONS: Record<ProblemCategoryId, ComponentType<IconProps>> = {
  health: HeartPulse,
  finance: Coins,
  career: TrendingUp,
  relationships: HeartHandshake,
  litigation: Scale,
  mental_peace: Flower2,
};
