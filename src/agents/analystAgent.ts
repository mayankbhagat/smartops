import { z } from 'zod';
import { runAgentStructured } from './baseAgent';

export const analystSchema = z.object({
  revenue: z.number().describe("Total calculated revenue"),
  expenses: z.number().describe("Total calculated expenses"),
  profitMargin: z.number().describe("Profit margin as a percentage"),
  trends: z.array(z.string()).describe("List of observed financial trends"),
  summary: z.string().describe("A brief analyst summary of the financial health")
});

export type AnalystOutput = z.infer<typeof analystSchema>;

export async function runAnalystAgent(businessId: string, salesData: any[], expensesData: any[]) {
  const systemPrompt = `You are an expert Financial Business Analyst.
Analyze the provided sales and expense data. Calculate the total revenue, total expenses, and profit margin.
Identify key trends (e.g., increasing costs, seasonal revenue drops) and provide a concise summary.`;

  const userPrompt = `Sales Data:
${JSON.stringify(salesData, null, 2)}

Expenses Data:
${JSON.stringify(expensesData, null, 2)}

Provide your financial analysis based on this data.`;

  return runAgentStructured<AnalystOutput>(
    'analyst',
    systemPrompt,
    userPrompt,
    analystSchema,
    { businessId, data: { salesCount: salesData.length, expensesCount: expensesData.length } }
  );
}
