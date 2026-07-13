/** Agent orb — gradient texture circle; agents are orbs, never avatars. Industry orbs: Healthcare=orb-spray, Financial=orb-mick, Business=orb-vivid, Sports=orb-lime. */
export interface OrbProps {
  /** texture image, e.g. assets/orb-spray.webp / orb-prism / orb-navy / orb-violet */
  src?: string;
  size?: number;
  /** neighbour treatment: 45% opacity, desaturated */
  dim?: boolean;
  /** breathing + green ripple rings (mic-on state, matches KiraVoiceDemo) */
  live?: boolean;
  /** conic-gradient-ring call button pinned below (dark center; green when live) */
  call?: boolean;
  style?: React.CSSProperties;
}