import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
    wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
  });
  return ffmpeg;
}

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.src = URL.createObjectURL(file);
  });
}

export interface ExtractedMedia {
  audio: Uint8Array;
  frames: { timestamp: number; base64: string }[];
  duration: number;
}

export async function extractMedia(file: File): Promise<ExtractedMedia> {
  const ff = await getFFmpeg();
  const duration = await getVideoDuration(file);

  await ff.writeFile('input.mp4', await fetchFile(file));

  await ff.exec([
    '-i', 'input.mp4',
    '-vn', '-acodec', 'pcm_s16le',
    '-ar', '16000', '-ac', '1',
    'audio.wav',
  ]);
  const audio = (await ff.readFile('audio.wav')) as Uint8Array;

  await ff.exec([
    '-i', 'input.mp4',
    '-vf', 'fps=1/2',
    '-q:v', '4',
    'frame_%03d.jpg',
  ]);

  const frames: { timestamp: number; base64: string }[] = [];
  const count = Math.ceil(duration / 2);
  for (let i = 1; i <= count; i++) {
    const name = `frame_${String(i).padStart(3, '0')}.jpg`;
    try {
      const data = (await ff.readFile(name)) as Uint8Array;
      let binary = '';
      for (let j = 0; j < data.length; j++) {
        binary += String.fromCharCode(data[j]);
      }
      frames.push({ timestamp: (i - 1) * 2, base64: btoa(binary) });
    } catch {
      // frame missing — ignore
    }
  }

  return { audio, frames, duration };
}