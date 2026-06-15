import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export const transcribeAudio = async (filePath: string, originalName = 'recording.m4a'): Promise<string> => {
  const ext = path.extname(originalName) || '.m4a';
  const filename = `recording${ext}`;

  const file = await toFile(fs.createReadStream(filePath), filename, {
    type: mimeTypeFromExt(ext),
  });

  const transcription = await openai.audio.translations.create({
    file,
    model: 'whisper-1',
  });

  return transcription.text;
};

const mimeTypeFromExt = (ext: string): string => {
  const map: Record<string, string> = {
    '.m4a': 'audio/m4a',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
    '.mp4': 'audio/mp4',
    '.3gp': 'audio/3gpp',
  };
  return map[ext] ?? 'audio/m4a';
};
