/** The signature voice motif — rounded animated bars in brand hues. */
export interface WaveformProps {
  bars?: number;
  /** container height px (bars scale within) */
  height?: number;
  animate?: boolean;
  /** single white-ish tone for subtle placements */
  mono?: boolean;
  style?: React.CSSProperties;
}