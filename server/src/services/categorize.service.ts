import OpenAI from 'openai';
import { env } from '../config/env';
import type { Category } from '../modules/audio/audio.types';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a personal life tracker. Extract structured categories from the user's input.
Return ONLY a valid JSON object with a "categories" array like:
{ "categories": [{ "category": "lunch_food", "value": "biriyani" }, { "category": "lunch_expense", "value": 150 }] }

Supported categories:

FOOD (value = food name as string):
  breakfast_food, lunch_food, dinner_food, snack_food

FOOD EXPENSES (value = number):
  breakfast_expense, lunch_expense, dinner_expense, snack_expense

GENERAL EXPENSES (value = number) — use these when no meal context:
  entertainment_expense  (movies, concerts, events, games, OTT subscriptions)
  transport_expense      (auto, cab, bus, train, petrol, parking, toll)
  shopping_expense       (clothes, electronics, accessories, groceries, household)
  health_expense         (medicine, doctor, hospital, pharmacy, gym)
  other_expense          (anything that doesn't fit the above)

HEALTH & HABITS (value = number or string):
  water_intake   (number, in litres)
  exercise       (string, describe activity)
  mood           (string: happy / sad / stressed / calm / tired / excited)
  sleep_hours    (number)
  weight         (number, in kg)
  notes          (string, anything else worth logging)

Rules:
- All expense values MUST be numbers, never strings.
- If a meal expense is mentioned with meal context (e.g. "lunch cost 100"), use the meal-specific key.
- If an expense has no meal context (e.g. "movie ticket 150", "cab fare 80"), use a general expense key.
- Do NOT return a category if it is not mentioned in the input.
- Do NOT return an empty categories array if there is clearly an expense or activity mentioned — find the best matching category.`;

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
