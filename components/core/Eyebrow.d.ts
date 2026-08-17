/** Section kicker — pill capsule (default) or uppercase text kicker. */
export interface EyebrowProps {
  /** dark-surface color treatment */
  onDark?: boolean;
  /** render as 12/700/.14em uppercase text instead of a pill */
  kicker?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}