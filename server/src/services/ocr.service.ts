import Tesseract from 'tesseract.js';
import { logger } from '../utils/logger';

export const extractTextFromImage = async (imagePath: string): Promise<string> => {
  const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        logger.debug(`OCR progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  const cleaned = text.trim();
  if (!cleaned) {
    throw new Error('OCR extracted no text from the image');
  }
  return cleaned;
};
