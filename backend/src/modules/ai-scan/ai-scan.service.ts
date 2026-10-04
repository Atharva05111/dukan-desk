import { Injectable } from '@nestjs/common';
import { DEFAULT_VISION_MODEL, geminiFailure, getGemini } from '../common/gemini';

export interface DraftMenuItem {
  name: string;
  price: number;
  category?: string;
}

const EXTRACTION_PROMPT = `
You are reading a photo taken by a shop owner in India. It is either:
- a restaurant/cafe menu (many items), or
- a single product or its packaging (one item — use the printed MRP as the price).

Extract every item you can clearly read as a JSON array of objects with
"name" (string), "price" (number in rupees, no currency symbol) and
"category" (string, your best guess). For packaged products, include the size
in the name, e.g. "Amul Taaza Milk 500ml". If a price is unreadable, omit that item.
If you can't find any items, return [].
`;

@Injectable()
export class AiScanService {
  async extractItemsFromImage(imageBase64: string, mimeType: string): Promise<DraftMenuItem[]> {
    const ai = getGemini();

    let text: string | undefined;
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_VISION_MODEL ?? DEFAULT_VISION_MODEL,
        contents: [{ inlineData: { mimeType, data: imageBase64 } }, { text: EXTRACTION_PROMPT }],
        // Ask for raw JSON so we don't have to strip ```json fences from the reply.
        config: { responseMimeType: 'application/json' },
      });
      text = response.text;
    } catch (err) {
      throw geminiFailure(err);
    }

    return this.parseDraftItems(text);
  }

  // Never trust model output blindly: keep only well-formed items. These are
  // drafts — the owner reviews and edits them before anything is saved.
  private parseDraftItems(text: string | undefined): DraftMenuItem[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text ?? '[]');
    } catch {
      throw geminiFailure(new Error(`Menu scan returned non-JSON: ${text}`));
    }
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((i) => i && typeof i.name === 'string' && i.name.trim() && Number(i.price) > 0)
      .map((i) => ({
        name: i.name.trim(),
        price: Math.round(Number(i.price) * 100) / 100,
        category: typeof i.category === 'string' ? i.category : undefined,
      }));
  }
}
