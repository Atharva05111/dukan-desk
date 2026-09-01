import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface DraftMenuItem {
  name: string;
  price: number;
  category?: string;
}

const EXTRACTION_PROMPT = `
You are reading a photo of a restaurant/cafe/retail price menu.
Extract every item you can read as strict JSON: an array of objects with
"name" (string), "price" (number, no currency symbol), and "category" (string, best guess).
Return ONLY the JSON array, nothing else. If a price is unreadable, omit that item.
`;

@Injectable()
export class AiScanService {
  private readonly genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

  async extractMenuFromImage(imageUrl: string): Promise<DraftMenuItem[]> {
    const model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_VISION_MODEL ?? 'gemini-1.5-pro',
    });

    // TODO: fetch imageUrl bytes and pass as inlineData (base64) instead of a
    // bare URL — Gemini's SDK requires the image bytes, not a remote link.
    const result = await model.generateContent([
      EXTRACTION_PROMPT,
      { text: `Image reference: ${imageUrl}` },
    ]);

    const text = result.response.text();
    try {
      return JSON.parse(text) as DraftMenuItem[];
    } catch {
      // Gemini didn't return clean JSON — surface raw text for debugging/review.
      throw new Error(`Could not parse menu-scan response: ${text}`);
    }
  }
}
