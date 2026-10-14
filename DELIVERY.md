# Delivery Notes — ScreenGuide

**Live:** https://screenguide-mu.vercel.app/
**Repo:** https://github.com/abaasi888/screenguide

## What it does
Upload a 2-minute screen recording. Get a timestamped how-to guide with
numbered steps, clickable timestamps, discarded mistakes, missing-step
flags, and final settings.

## Architecture
Browser-first Next.js app. The client extracts audio + frames locally with
ffmpeg.wasm, then calls two serverless API routes:
- POST /api/transcribe → Groq Whisper large-v3
- POST /api/analyse → Google Gemini 3.1 Flash-Lite

API routes keep keys server-side. No database, no queue, no auth.

## Stack
- Next.js 16 (App Router, TypeScript, webpack)
- ffmpeg.wasm 0.12 (browser-side audio + frame extraction)
- Groq Whisper large-v3 (transcription)
- Google Gemini 3.1 Flash-Lite (vision + reasoning)
- Vercel Hobby (hosting + serverless functions)
- Plain external CSS

## Sample inputs
- test-videos/orders_normal.mp4       (clean run)
- test-videos/orders_correction.mp4   (mistake + correction)
- test-videos/orders_missing.mp4      (skipped critical step)
- test-videos/orders_changed.mp4      (one setting changed)

## Test results

### orders_normal.mp4 — PASS
- Steps: 6
- Discarded: none
- Missing: "Authentication" (user already logged in)
- Final settings: { product: "Samsung Galaxy A06", payment_method: "MTN Mobile Money", delivery_type: "Door Delivery" }
- Evidence: vision-only (no narration)

### orders_correction.mp4 — PASS
- Steps: 5
- Discarded: "View multiple products — browsing before editing the cart"
- Missing: "Add items to cart", "Complete final checkout"
- Final settings: { cart_items: "1", selected_payment_method: "MTN XXXX 2682" }
- Limitation: steps 2–5 share timestamp [2:00] due to 1/10s frame sampling

### orders_missing.mp4 — PASS
- Steps: 3
- Discarded: "Struggled to locate product in the cart"
- Missing: "Account Login", "Payment Confirmation"
- Final settings: { cart_items: "3", payment_method: "MTN Mobile Money", delivery_type: "Door Delivery" }

### orders_changed.mp4 — PASS
- Steps: 3
- Discarded: "Clicking remove button for other items"
- Missing: "Complete checkout/payment"
- Final settings: { cart_status: "updated", checkout_action: "initiated" }

## Changed-recording check — PASS
- orders_normal ends with a completed purchase
- orders_changed ends with a cart update and checkout initiation
- The tool correctly distinguishes the two final states

## Speed (measured locally)
- ffmpeg extraction: ~10–30 s
- Groq Whisper: ~5–10 s
- Gemini analyse: ~15–30 s
- Total to useful result: 30–70 s

## Cost

| Item | Free tier | Per 2-min video |
|---|---|---|
| Groq Whisper | 2000 req/day, 25 MB cap | $0.00 |
| Gemini 3.1 Flash-Lite | 500 req/day, 15 RPM | $0.00 |
| ffmpeg.wasm | client-side | $0.00 |
| Vercel Hobby | 100 GB-hrs/mo | $0.00 |
| **Total** | | **$0.00** |

Rate limits are the constraint, not cost.
Paid-equivalent estimate: ~$0.16 per 2-minute video.

## What failed / limitations
- Turbopack can't resolve ffmpeg.wasm's worker; build uses webpack (`next build --webpack`)
- ffmpeg.wasm stalls on High-profile H.264 at 720p; sources were re-encoded to Constrained Baseline at 640×360
- Vercel serverless function body limit is 4.5 MB; audio is encoded at 8 kHz mono to fit
- Frame sampling at 1 per 10 seconds collapses closely-spaced actions to the same timestamp
- Gemini occasionally misreads blurry UI text; the "missing" flag surfaces it
- No queue; concurrent uploads can hit Groq's 30 RPM limit

## AI tools and models
- Groq: whisper-large-v3
- Google: gemini-3.1-flash-lite
- Reused: ffmpeg.wasm, groq-sdk, @google/generative-ai, zod, Next.js
- Own additions: pipeline orchestration, Zod-validated schema, evidence linking,
  correction-removal logic, missing-step flags, webpack build fix

## One example of checking AI output
For step "Select the Samsung Galaxy A06 product" in orders_normal.mp4,
I clicked the cited timestamp [0:09], inspected the corresponding frame,
and confirmed the product page for that phone was visible. In an earlier
run, Gemini invented a click that wasn't in the video; I tightened the
system prompt to require "vision" or "transcript" evidence tags and re-ran.
The fabrication disappeared.

## Time spent
Approximately 7 focused hours across two sessions.

## What I'd improve next
- Human-in-the-loop correction UI
- OCR fallback for small UI text
- Scene-change-based frame sampling instead of fixed 1/10s
- Local model option for privacy
- Cost cap per video and retry budget