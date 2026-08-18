/** Liquid-glass floating card (site .lqcard) — dark blur card for channel moments over video/dark. */
export interface GlassCardProps {
  /** uppercase category with gradient dot, e.g. "Payment reminders" */
  label?: string;
  /** right-aligned channel meta, e.g. "SMS" or "Voice · live" */
  meta?: string;
  width?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}