import { z } from 'zod';

const categorySchema = z.object({
  category: z.string().min(1),
  value: z.union([z.string(), z.number()]),
});

export const confirmSaveSchema = z.object({
  transcription: z.string().min(1),
  categories: z.array(categorySchema),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  source: z.enum(['audio', 'text', 'image']).optional(),
});

export const processTextSchema = z.object({
  text: z.string().min(1),
});

export type ConfirmSaveInput = z.infer<typeof confirmSaveSchema>;
export type ProcessTextInput = z.infer<typeof processTextSchema>;
