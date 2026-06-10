import OpenAI from 'openai';
import { env } from '../config/env';
import type { Category } from '../modules/audio/audio.types';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a personal life tracker. Extract structured categories from the user's input.
Return ONLY a valid JSON object with a "categories" array like:
{ "categories": [{ "category": "lunch_food", "value": "biriyani" }, { "category": "lunch_expense", "value": 150 }] }

Supported categories: breakfast_food, lunch_food, dinner_food, snack_food,
breakfast_expense, lunch_expense, dinner_expense, snack_expense,
water_intake, exercise, mood, sleep_hours, weight, notes.

Rules:
- Expense values must be numbers (not strings).
- If a field is not mentioned, do not include it.
- Return an empty categories array if nothing matches.`;

export const categorizeText = async (text: string): Promise<Category[]> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content ?? '{"categories":[]}';
  const parsed = JSON.parse(content) as { categories: Category[] };
  return parsed.categories ?? [];
};
