# Voice Demo Notes

Last checked: 2026-07-09

The landing page uses public Kira voice-demo tokens from the staging/demo Convex deployment at `https://acoustic-ermine-603.convex.cloud`. Each token resolves server-side before the browser receives a short-lived LiveKit room token.

## Current Demo Token Audit

| Section | Label | Public token | Kira agent | Tenant | TTS model | Voice ID |
|---|---|---|---|---|---|---|
| Healthcare | Post-discharge care | `df55c925dce942a48159b9d14a3deced` | Nic - Heart Care Post-Discharge | KeyReply | `rime/coda` | `adeline` |
| Healthcare | PT intake & booking | `ced58fd477a8490faabaf124af8144ff` | Riley - Wrenfield PT Intake | KeyReply | `elevenlabs/eleven_flash_v2_5` | `C3x1TEM7scV4p2AXJyrp` |
| Financial | Card disputes & collections | `afc88ae09b7d4975818e68100ed80422` | Nora - Alderway Card Resolution | KeyReply | `elevenlabs/eleven_flash_v2_5` | `tnSpp4vdxKPjI9w0GnoV` |
| Business | Customer service | `a2a43d2c4ff74a5988ada4d442e4ae63` | David - Asahi Beverages Customer Service | KeyReply | `elevenlabs/eleven_turbo_v2_5` | `unROvA6wrI5G5MtDhPFJ` |
| Sports | Fan engagement | `778100d8b208486f8f8acab6b29fd9a4` | Ernie - Tigers Fan Concierge (agent-753ffe3e) | KeyReply | `elevenlabs/eleven_flash_v2_5` | `ljX1ZrXuDIIRVcmiVSyR` |
| Sports | Suite recovery | `bbc93f725de44f4f90d41d02151b7892` | Joey - Yankees Suite Cart Recovery (agent-89466bba, VAPI "Attend") | KeyReply | `elevenlabs/eleven_flash_v2_5` | `OBLxU3DhFiBOh33EeRvi` |

## Notes

- All eight public tokens resolve and mint LiveKit tokens.
- The inline landing-page widget uses `<kira-voice-agent headless demo-token="..." convex-url="https://acoustic-ermine-603.convex.cloud">` so the Vercel call UI controls the working Kira connection.
- `Suite recovery` currently points to `Marty - Tigers Suite Recovery` and is now shown under Sports in the imported Vercel UI.
- Voice links are split across the `KeyReply` and `whatsapp-flow` tenants. This works because tokens resolve server-side, but ownership should be consolidated if the demos need a clean operational boundary.
