#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# The live voice demo is retired: its pages and the LiveKit widget are kept in the
# repo (restoring the demo is then a one-line change) but are NOT published, so the
# widget cannot load and the demo pages are not reachable by URL.
rsync -a \
  --exclude "KiraVoiceDemo.dc.html" \
  --exclude "KiraVoiceDemo White.dc.html" \
  "$ROOT_DIR"/*.html \
  "$ROOT_DIR"/*.dc.html \
  "$ROOT_DIR"/support.js \
  "$ROOT_DIR"/llms.txt \
  "$ROOT_DIR"/sitemap.xml \
  "$ROOT_DIR"/robots.txt \
  "$ROOT_DIR"/favicon.ico \
  "$ROOT_DIR"/_redirects \
  "$DIST_DIR"/

rsync -a "$ROOT_DIR"/assets "$DIST_DIR"/
# The form fragment the modal displays - not a page. It lives in a subdirectory
# so harden-csp.mjs (which only walks the bundle root) leaves it alone: its
# inline script and styles are exactly what the HubSpot embed needs, and
# /embed/* carries its own policy below.
rsync -a "$ROOT_DIR"/embed "$DIST_DIR"/
rsync -a \
  --exclude "voice-widget.js" \
  --exclude "_content-notes.md" \
  --exclude "rev-asian-man.png" \
  --exclude "rev-blue-man.png" \
  --exclude "hero-business3.mp4" \
  --exclude "hero-finance3.mp4" \
  --exclude "hero-healthcare.mp4" \
  --exclude "hero-sports2.mp4" \
  --exclude "poster-home.webp" \
  --exclude "poster-business3.jpg" \
  --exclude "poster-business4.jpg" \
  --exclude "poster-finance3.jpg" \
  --exclude "poster-healthcare.webp" \
  --exclude "poster-healthcare3.jpg" \
  --exclude "poster-sports2.jpg" \
  "$ROOT_DIR"/rz "$DIST_DIR"/

node "$ROOT_DIR/scripts/harden-csp.mjs" "$DIST_DIR"

# Hero videos are pre-optimized in the repo (rz/hero-*.mp4): the over-bitrate
# ones are re-encoded to a smaller, visually-transparent H.264 and every
# referenced clip already has its moov atom at the front (faststart), so the
# browser can begin playback before the file finishes downloading. This is done
# once at authoring time rather than on every deploy, so the build stays
# deterministic and needs no ffmpeg on the runner.

# The site only frames the same-origin /embed/ wrapper. HubSpot itself never runs
# in a site document, so no HubSpot submission or script origins belong here.
SITE_CSP="default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' https://www.googletagmanager.com; script-src-attr 'none'; style-src 'self' https://fonts.googleapis.com; style-src-attr 'none'; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://www.google-analytics.com https://www.gstatic.com https://www.google.com; media-src 'self' data: blob:; connect-src 'self' https://acoustic-ermine-603.convex.cloud https://assessment-2q4j58ef.livekit.cloud wss://assessment-2q4j58ef.livekit.cloud https://www.google-analytics.com https://region1.google-analytics.com; worker-src 'self' blob:; frame-src 'self'; form-action 'self'; manifest-src 'self'; upgrade-insecure-requests"

# The wrapper runs HubSpot's standard loader, which creates a hosted HubSpot
# iframe. Submission, validation, captcha, styles and tracking then run under
# HubSpot's policy, not ours. Inline script/style remain limited to this wrapper's
# redirect guard, fallback message and generated iframe sizing.
FORM_CSP="default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'self'; script-src 'unsafe-inline' https://js.hsforms.net; script-src-attr 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; style-src-attr 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'none'; frame-src https://js.hsforms.net; form-action 'none'; upgrade-insecure-requests"

# Rules are written per route rather than under one /* wildcard: a wildcard that
# also matched /embed/ would layer the strict policy on top of the embed policy,
# and a browser enforces every policy it is sent, so the form would stay blocked.
{
  printf '/\n  Content-Security-Policy: %s\n  Cache-Control: public, max-age=0, must-revalidate\n\n' "$SITE_CSP"
  for page in "$DIST_DIR"/*.html; do
    name="$(basename "$page")"
    printf '/%s\n  Content-Security-Policy: %s\n  Cache-Control: public, max-age=0, must-revalidate\n\n' \
      "$name" "$SITE_CSP"
    printf '/%s\n  Content-Security-Policy: %s\n  Cache-Control: public, max-age=0, must-revalidate\n\n' \
      "${name%.html}" "$SITE_CSP"
  done
  printf '/embed/*\n  Content-Security-Policy: %s\n  Cache-Control: public, max-age=0, must-revalidate\n\n' "$FORM_CSP"
  printf '/*\n  Strict-Transport-Security: max-age=31536000\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(self), geolocation=()\n\n'
  printf '/rz/*\n  Cache-Control: public, max-age=31536000, immutable\n\n'
  printf '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n'
} > "$DIST_DIR/_headers"

awk 'length > 2000 { printf "_headers line %d is %d characters; Cloudflare rejects over 2000.\n", NR, length > "/dev/stderr"; bad = 1 }
     END { exit bad }' "$DIST_DIR/_headers" || exit 1

node "$ROOT_DIR/scripts/check-csp.mjs" "$DIST_DIR"

find "$DIST_DIR" -type f -size +25M -print -quit | grep -q . && {
  echo "Deploy bundle contains files over Cloudflare's 25 MiB asset limit." >&2
  find "$DIST_DIR" -type f -size +25M -exec ls -lh {} \; >&2
  exit 1
}

echo "Prepared deploy bundle:"
du -sh "$DIST_DIR"
find "$DIST_DIR" -type f | wc -l | awk '{print $1 " files"}'
