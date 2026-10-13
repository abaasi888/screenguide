'use client';

import { useState } from 'react';
import { extractMedia } from '@/lib/ffmpeg';
import { Guide } from '@/lib/schema';
import GuideView from '@/components/Guide';

type Status = 'idle' | 'extracting' | 'transcribing' | 'analysing' | 'done' | 'error';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [guide, setGuide] = useState<Guide | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');

  const handleFile = (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setGuide(null);
    setError('');
    setStatus('idle');
  };

  const generate = async () => {
    if (!file) return;
    try {
      setError('');
      setStatus('extracting');
      const { audio, frames } = await extractMedia(file);

      setStatus('transcribing');
      const audioBlob = new Blob([audio as Uint8Array<ArrayBuffer>], { type: 'audio/wav' });
      const fd = new FormData();
      fd.append('audio', audioBlob, 'audio.wav');
      const transRes = await fetch('/api/transcribe', { method: 'POST', body: fd });
      if (!transRes.ok) throw new Error('Transcription failed');
      const transcript = await transRes.json();

      setStatus('analysing');
      const analyseRes = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, frames }),
      });
      if (!analyseRes.ok) throw new Error('Analysis failed');
      const data = await analyseRes.json();

      setGuide(data);
      setStatus('done');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <main className="container">
      <h1>ScreenGuide</h1>
      <p className="subtitle">
        Upload a 2-minute screen recording. Get a timestamped how-to guide.
      </p>

      <input
        className="file-input"
        type="file"
        accept="video/mp4"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {file && (
        <button
          className="btn"
          onClick={generate}
          disabled={
            status === 'extracting' || status === 'transcribing' || status === 'analysing'
          }
        >
          {status === 'idle' ? 'Generate how-to' : status}
        </button>
      )}

      {error && <div className="error-box">{error}</div>}

      {guide && videoUrl && <GuideView guide={guide} videoUrl={videoUrl} />}
    </main>
  );
}