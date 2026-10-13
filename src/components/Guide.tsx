'use client';

import { Guide, Step } from '@/lib/schema';
import { useRef } from 'react';

interface Props {
  guide: Guide;
  videoUrl: string;
}

export default function GuideView({ guide, videoUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const seek = (t: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      videoRef.current.play();
    }
  };

  return (
    <div className="guide">
      <video ref={videoRef} src={videoUrl} controls />

      <section>
        <h2>Steps</h2>
        <ol className="steps">
          {guide.steps.map((step: Step) => (
            <li key={step.order} className="step">
              <div className="step-row">
                <span className="step-order">{step.order}.</span>
                <span>{step.instruction}</span>
                <button className="timestamp" onClick={() => seek(step.start)}>
                  [{formatTime(step.start)}]
                </button>
              </div>
              <div className="step-meta">
                confidence: {step.confidence.toFixed(2)} · evidence: {step.evidence.join(', ')}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {guide.discarded.length > 0 && (
        <section>
          <h2>Discarded mistakes</h2>
          <ul className="discarded-list">
            {guide.discarded.map((d, i) => (
              <li key={i}>{d.instruction} — {d.reason}</li>
            ))}
          </ul>
        </section>
      )}

      {guide.missing.length > 0 && (
        <section className="missing-box">
          <h2>⚠ Missing critical steps</h2>
          <ul>
            {guide.missing.map((m, i) => (
              <li key={i}>{m.step} — {m.reason}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Final settings</h2>
        <pre className="settings">{JSON.stringify(guide.final_settings, null, 2)}</pre>
      </section>
    </div>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}