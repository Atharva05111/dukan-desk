import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../common/prisma.service';
import { ReportsService } from '../reports/reports.service';

// RAG flow — see docs/04-flow-diagrams.md §5 and docs/03-architecture.md §5.
// IMPORTANT: every vector search / SQL query here MUST be filtered by
// businessId. Never let one owner's question retrieve another business's data.
@Injectable()
export class AssistantService {
  private readonly genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: ReportsService,
  ) {}

  async answer(businessId: string, question: string) {
    const { from, to } = this.resolveDateRange(question);

    // 1. Structured numbers from the single-source-of-truth P&L engine.
    const pnl = await this.reports.getProfitAndLoss(businessId, from, to);

    // 2. Retrieve relevant free-text context from this business's own embeddings only.
    //    TODO: embed `question` with GEMINI_EMBEDDING_MODEL, then run a pgvector
    //    similarity search: `SELECT * FROM "AiEmbedding" WHERE "businessId" = $1
    //    ORDER BY embedding <-> $2 LIMIT 5` (raw query — Prisma has no native vector ops yet).
    const context: string[] = [];

    // 3. Ask Gemini to answer using ONLY the retrieved context + computed numbers.
    const model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-1.5-flash',
    });

    const prompt = `
You are a business assistant for a small shop owner. Answer the question below
using ONLY the data provided. Always state the date range the numbers cover.
Do not invent numbers not present in the data.

Question: ${question}

Computed P&L for ${from.toDateString()} to ${to.toDateString()}:
${JSON.stringify(pnl, null, 2)}

Additional context:
${context.join('\n') || '(none retrieved)'}
`;

    const result = await model.generateContent(prompt);
    return { answer: result.response.text(), period: { from, to }, numbers: pnl };
  }

  // Very rough placeholder — replace with a proper date-range parser
  // (e.g. "this month", "last week", "in July") before shipping.
  private resolveDateRange(_question: string): { from: Date; to: Date } {
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth(), 1);
    return { from, to };
  }
}
