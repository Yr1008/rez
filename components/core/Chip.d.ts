/** Filter / tag pill (site .wchip + story pills). */
export interface ChipProps {
  /** selected state — inverts to ink (light) or white (dark) */
  on?: boolean;
  onDark?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}