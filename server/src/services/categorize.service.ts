import OpenAI from 'openai';
import { env } from '../config/env';
import type { Category } from '../modules/audio/audio.types';

const isValidCategory = (c: unknown): c is Category =>
  c !== null &&
  typeof c === 'object' &&
  typeof (c as Record<string, unknown>).category === 'string' &&
  (c as Record<string, unknown>).category !== '' &&
  (c as Record<string, unknown>).value !== undefined;

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

const VISION_SYSTEM_PROMPT = `You are a personal expense tracker. You will be shown a photo of a bill or receipt.

Return ONLY a valid JSON object in this exact shape — no extra keys, no markdown:
{
  "summary": "<one sentence: what this bill is for, place name, and total amount>",
  "categories": [
    { "category": "<category_key>", "value": <number or string> }
  ]
}

CATEGORY RULES:

Restaurant / Food bill → return ALL THREE:
  { "category": "lunch_food", "value": "RestaurantName — item1, item2" }   ← meal time: breakfast/lunch/dinner/snack
  { "category": "lunch_expense", "value": <grand total as number> }
  { "category": "notes", "value": "item1 x1 ₹price, item2 x1 ₹price" }

Fuel / Petrol bill:
  { "category": "transport_expense", "value": <total as number> }
  { "category": "notes", "value": "Petrol/Diesel XL @ ₹rate/L" }

Shopping bill:
  { "category": "shopping_expense", "value": <total as number> }
  { "category": "notes", "value": "item1 x1 ₹price, item2 x1 ₹price" }

Pharmacy / Hospital:
  { "category": "health_expense", "value": <total as number> }
  { "category": "notes", "value": "medicine or service names" }

Movie / Entertainment:
  { "category": "entertainment_expense", "value": <total as number> }
  { "category": "notes", "value": "what was booked" }

Anything else:
  { "category": "other_expense", "value": <total as number> }
  { "category": "notes", "value": "brief description" }

STRICT RULES:
- expense values MUST be plain numbers — never strings like "450" or "₹450".
- Use the FINAL total / grand total / net payable — never subtotals.
- For food bills the *_food value must include the restaurant name and items eaten.
- Choose breakfast/lunch/dinner/snack based on what is visible on the bill or current time of day.
- ALWAYS return at least one expense category. Never return an empty categories array.`;

export interface ImageCategorizationResult {
  summary: string;
  categories: Category[];
}

export const categorizeImageWithVision = async (imageBase64: string): Promise<ImageCategorizationResult> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: VISION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'auto' },
          },
          { type: 'text', text: 'Extract all expense categories from this bill.' },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 800,
  });

  const content = response.choices[0].message.content ?? '{"summary":"Bill scanned","categories":[]}';
  const parsed = JSON.parse(content) as { summary?: string; categories?: unknown };
  const rawCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
  return {
    summary: parsed.summary ?? 'Bill scanned',
    categories: rawCategories.filter(isValidCategory),
  };
};

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
  const parsed = JSON.parse(content) as { categories?: unknown };
  const rawCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
  return rawCategories.filter(isValidCategory);
};
