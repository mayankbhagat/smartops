import { generateObject } from 'ai';
import { google as defaultGoogle, createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { csvData } = await req.json();

    if (!csvData) {
      return new Response('csvData is required', { status: 400 });
    }

    const systemPrompt = `You are a highly advanced Supply Chain & Financial Analyst AI.
The user has uploaded a raw CSV dump of their operations in India (containing Date, Nodes, Inventory, Throughput, Revenue, Expenses).
Your task:
1. Parse and understand the geographic node metrics and financial data over the 6 months.
2. Formulate exactly 6 months of dynamically projected/aggregated chart data mapping the month abbreviation to the total aggregate revenue & expenses.
3. Determine rigorous location-based product recommendations. Specifically, detail expected percentage profit gains and loss risks if new product types are injected into these regions based on current capacity and throughput margins.`;

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `Analyze the following CSV dataset and return the structured JSON strictly conforming to the schema:\n\n${csvData}`,
      schema: z.object({
        chartData: z.array(z.object({
          month: z.string().describe("3-letter month abbreviation (e.g. 'Jan', 'Feb')"),
          revenue: z.number().describe("Aggregated total monthly incoming revenue"),
          expenses: z.number().describe("Aggregated total monthly outgoing expenses")
        })).min(1),
        insights: z.array(z.object({
          type: z.enum(['success', 'warning', 'info']),
          title: z.string(),
          desc: z.string()
        })).describe("3 critical insights discovered within the dataset logs."),
        inventoryRecommendations: z.array(z.object({
          productName: z.string(),
          action: z.enum(['Increase Stock', 'Decrease Stock', 'Introduce New Line', 'Hold']),
          estimatedProfitGainPercent: z.number(),
          estimatedLossRiskPercent: z.number(),
          reasoning: z.string()
        }))
      })
    });

    return new Response(JSON.stringify(result.object), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error("CSV ANALYSIS ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
