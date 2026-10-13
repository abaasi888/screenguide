import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (e.status === 429 && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  throw new Error('unreachable');
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('audio') as File;

  if (!file) {
    return Response.json({ error: 'No audio file' }, { status: 400 });
  }

  const transcription = await withRetry(() =>
    groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    })
  );

  return Response.json(transcription);
}