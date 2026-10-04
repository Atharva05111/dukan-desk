import { BadGatewayException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

// Defaults when GEMINI_*_MODEL env vars aren't set. Google retires model versions
// regularly — check https://ai.google.dev/gemini-api/docs/models if calls start failing.
export const DEFAULT_VISION_MODEL = 'gemini-3.8-flash';
export const DEFAULT_TEXT_MODEL = 'gemini-3.8-flash';

const logger = new Logger('Gemini');
let client: GoogleGenAI | null = null;

// Shared Gemini client. Throws a clear 503 instead of a confusing Google error
// when the server simply hasn't been given an API key yet.
export function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'not-set' || apiKey === 'your-gemini-api-key') {
    throw new ServiceUnavailableException('AI features are not set up yet: the server has no GEMINI_API_KEY.');
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

// Turn a failed Gemini call into a short, user-safe error. The full error goes
// to the server logs (Render → Logs) for debugging.
export function geminiFailure(err: unknown): BadGatewayException {
  logger.error(err instanceof Error ? err.message : String(err));
  return new BadGatewayException('The AI service could not process this request. Please try again.');
}
