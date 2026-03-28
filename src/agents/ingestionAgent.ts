import { z } from 'zod';
import { runAgentStructured } from './baseAgent';

export const ingestionSchema = z.object({
  extractedData: z.array(z.object({
    type: z.enum(['Sale', 'Expense', 'Inventory', 'Unknown']),
    date: z.string().optional(),
    amount: z.number().optional(),
    item: z.string().optional(),
    quantity: z.number().optional(),
    description: z.string().optional()
  })).describe("List of structured data points extracted from the raw input"),
  summary: z.string().describe("A summary of the extracted data"),
  requiresHumanReview: z.boolean().describe("True if some data is ambiguous or couldn't be parsed")
});

export type IngestionOutput = z.infer<typeof ingestionSchema>;

export async function runIngestionAgent(businessId: string, rawText: string) {
  const systemPrompt = `You are an expert Data Engineer AI.
Your job is to parse unstructured raw text (like OCR text from an invoice, copied text from a CSV, or manual entry) and extract structured data points representing Sales, Expenses, or Inventory updates.
Normalize dates to ISO format where possible.
Extract amounts as numerical values.`;

  const userPrompt = `Raw Data Input:
${rawText}

Extract structured data from this input.`;

  return runAgentStructured<IngestionOutput>(
    'ingestion',
    systemPrompt,
    userPrompt,
    ingestionSchema,
    { businessId, data: null }
  );
}
