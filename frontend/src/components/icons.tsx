/* Flat, modern icon system.
 * - Functional/category icons: lucide-react (stroke-based, inherit currentColor)
 * - Sacred marks lucide lacks (diya lamp, Om) are hand-drawn line SVGs in the same style.
 */
import type { ProblemCategoryId } from "../types";
import { CATEGORY_ICONS } from "../categoryIcons";

/** Category glyph used on the problem picker and results accordions. */
export function CategoryIcon({
  id,
  size = 20,
  strokeWidth = 1.8,
}: {
  id: ProblemCategoryId;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = CATEGORY_ICONS[id];
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

/** Hand-drawn diya (oil lamp) — used on the Ganesha banner & universal remedy card. */
export function DiyaIcon({
  size = 24,
  strokeWidth = 1.6,
  className,
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* flame */}
      <path d="M12 2.8c1 1.9 2.5 3.4 2.5 5.2a2.5 2.5 0 0 1-5 0c0-1.8 1.5-3.3 2.5-5.2Z" />
      {/* cotton wick */}
      <path d="M12 14.4v-2.6" />
      {/* bowl rim + body */}
      <path d="M4.8 15h14.4" />
      <path d="M4.8 15c.4 3.1 3.1 4.9 7.2 4.9s6.8-1.8 7.2-4.9" />
      {/* pedestal foot */}
      <path d="M9.6 20.5h4.8" />
    </svg>
  );
}

/** Om glyph — rendered as crisp text so it stays authentic on every platform. */
export function OmMark({ size = 14 }: { size?: number }) {
  return (
    <span
      className="om-mark"
      style={{ fontSize: Math.round(size * 1.25) }}
      aria-hidden="true"
    >
      ॐ
    </span>
  );
}
