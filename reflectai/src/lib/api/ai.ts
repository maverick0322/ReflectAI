import { requestJson } from './http';

export interface DailyQuoteResponse {
  data: {
    text: string;
    author: string;
    aiGenerated: boolean;
  };
  message: string;
}

export async function fetchDailyQuote() {
  return requestJson<DailyQuoteResponse>('/api/ai/daily-quote');
}
