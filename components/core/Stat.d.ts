/** Proof metric — big tabular number + uppercase label (site .cnum pattern). */
export interface StatProps {
  /** e.g. "82%", "24/7", "60+" */
  value: string;
  label: string;
  onDark?: boolean;
  style?: React.CSSProperties;
}