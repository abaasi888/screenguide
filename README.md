# ScreenGuide

Turn a short screen recording into a timestamped how-to guide.

Upload a 2-minute MP4 of a screen demonstration. Get back an ordered list of steps, each linked to a timestamp in the video, with discarded mistakes removed and missing critical steps flagged.

## Setup

1. `npm install`
2. Copy the ffmpeg core files into `public/`:
cp node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js public/
cp node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm public/

3. Create `.env.local`:
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key

4. `npm run dev`
5. Open http://localhost:3000

## Stack

- Next.js (App Router) + plain external CSS
- ffmpeg.wasm (browser-side audio + frame extraction)
- Groq Whisper large-v3 (transcription)
- Google Gemini 3.1 Flash-Lite (vision + reasoning)
- Vercel Hobby (hosting + serverless API routes)

## Architecture

Browser-first. The client extracts audio and frames locally with ffmpeg.wasm, then calls two serverless API routes:

- `POST /api/transcribe` → forwards the WAV to Groq Whisper, returns transcript with timestamps
- `POST /api/analyse` → sends transcript + frames to Gemini, returns a validated guide object

API routes exist only to keep the API keys server-side. No database, no queue, no auth.

## API keys

Both are free tier:

- Groq: https://console.groq.com/keys
- Google AI Studio: https://aistudio.google.com/apikey

## Operating cost

| Item | Free tier | Per 2-min video |
|---|---|---|
| Groq Whisper | 2000 req/day, 25 MB cap | $0.00 |
| Gemini Flash-Lite | 500 req/day, 15 RPM | $0.00 |
| ffmpeg.wasm | client-side | $0.00 |
| Vercel Hobby | 100 GB-hrs/mo | $0.00 |

Rate limits are the constraint, not cost.