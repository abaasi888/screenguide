import { GoogleGenerativeAI } from '@google/generative-ai';
import { GuideSchema } from '@/lib/schema';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You convert a screen recording into a how-to guide.
Use ONLY evidence from the transcript and frames.
Output JSON only. Do not invent clicks, menus, or success states.
Exclude abandoned mistakes from the recommended path, but list them in "discarded".
If a necessary step is not visible, put it in "missing" and explain.
Each step must include: order, instruction, start (seconds), end (seconds), frame (filename), confidence (0-1), evidence (array of "transcript" or "vision").
"final_settings" lists the final chosen settings.

Output schema:
{
  "steps": [{"order": number, "instruction": string, "start": number, "end": number, "frame": string, "confidence": number, "evidence": string[]}],
  "discarded": [{"instruction": string, "reason": string}],
  "missing": [{"step": string, "reason": string}],
  "final_settings": {"key": "value"}
}`;

export async function POST(req: Request) {
  const { transcript, frames } = await req.json();

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const parts: any[] = [
    { text: SYSTEM_PROMPT },
    { text: `Transcript segments: ${JSON.stringify(transcript.segments ?? transcript)}` },
  ];

  for (const frame of frames) {
    parts.push({
      inlineData: { mimeType: 'image/jpeg', data: frame.base64 },
    });
  }

  const result = await model.generateContent(parts);
  let text = result.response.text();
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const parsed = GuideSchema.parse(JSON.parse(text));
  return Response.json(parsed);
}