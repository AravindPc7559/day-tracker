import fs from 'fs';
import { categorizeImageWithVision } from '../../services/categorize.service';
import { logger } from '../../utils/logger';
import type { ProcessAudioResponse } from '../audio/audio.types';

export const processImage = async (filePath: string): Promise<ProcessAudioResponse> => {
  try {
    const imageBase64 = fs.readFileSync(filePath).toString('base64');

    const { summary, categories } = await categorizeImageWithVision(imageBase64);
    logger.info(`Vision returned ${categories.length} categories: ${JSON.stringify(categories)}`);

    const finalCategories = categories.length > 0
      ? categories
      : [{ category: 'notes', value: summary }];

    return { transcription: summary, categories: finalCategories };
  } finally {
    fs.unlink(filePath, () => {});
  }
};
