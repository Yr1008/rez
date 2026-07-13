/** Pill CTA. Variants mirror rz/site.css .btn-dark/.btn-white/.btn-glass/.btn-glow; hero size = 48px/178px min.
 * @startingPoint section="Components" subtitle="Rezonate pill CTA — dark, white, glass, glow" viewport="700x220"
 */
export interface ButtonProps {
  /** 'dark' | 'white' | 'glass' (dark surfaces only) | 'glow' (gradient ring, primary hero CTA) */
  variant?: 'dark' | 'white' | 'glass' | 'glow';
  /** 'sm' 36px · 'md' 44px · 'hero' 48px + 178px min-width */
  size?: 'sm' | 'md' | 'hero';
  /** trailing → that nudges on hover */
  arrow?: boolean;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}