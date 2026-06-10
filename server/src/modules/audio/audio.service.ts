import fs from 'fs';
import { transcribeAudio } from '../../services/whisper.service';
import { categorizeText } from '../../services/categorize.service';
import { saveEntry } from '../logs/logs.service';
import type { ProcessAudioResponse, ConfirmSaveInput, ConfirmSaveResponse } from './audio.types';

export const processAudio = async (filePath: string, originalName?: string): Promise<ProcessAudioResponse> => {
  try {
    const transcription = await transcribeAudio(filePath, originalName);
    const categories = await categorizeText(transcription);
    return { transcription, categories };
  } finally {
    fs.unlink(filePath, () => {});
  }
};

export const processText = async (text: string): Promise<ProcessAudioResponse> => {
  const categories = await categorizeText(text);
  return { transcription: text, categories };
};

export const confirmSave = async (
  uid: string,
  input: ConfirmSaveInput
): Promise<ConfirmSaveResponse> => {
  const entryId = await saveEntry(uid, input);
  return { entryId };
};
