import { z } from 'zod';
import { runAgentStructured } from './baseAgent';

export const forecastSchema = z.object({
  quarterlyProjections: z.array(z.object({
    quarter: z.string().describe("e.g. 'Q3 2026'"),
    projectedRevenue: z.number(),
    projectedExpenses: z.number(),
    projectedProfit: z.number(),
    confidence: z.number().min(0).max(100).describe("Confidence percentage"),
  })).describe("Next 2 quarter projections based on trend analysis"),
  sixMonthForecast: z.object({
    totalProjectedRevenue: z.number(),
    totalProjectedExpenses: z.number(),
    bestCaseProfit: z.number(),
    worstCaseProfit: z.number(),
    growthTrajectory: z.enum(['accelerating', 'steady', 'decelerating', 'declining']),
  }),
  riskFactors: z.array(z.object({
    factor: z.string(),
    severity: z.enum(['high', 'medium', 'low']),
    mitigation: z.string(),
  })).describe("Key financial risks identified from trend data"),
  recoveryStrategies: z.array(z.object({
    strategy: z.string(),
    expectedImpact: z.string(),
    timeframeWeeks: z.number(),
    priority: z.enum(['critical', 'high', 'medium']),
  })).describe("If losses are detected, specific recovery strategies"),
  summary: z.string().describe("Concise 2-3 sentence forecast executive summary"),
});

export type ForecastOutput = z.infer<typeof forecastSchema>;

export async function runForecastAgent(businessId: string, salesData: any[], expensesData: any[], analystOutput: any) {
  const systemPrompt = `You are an elite Revenue Forecasting AI specializing in business financial projections.
Analyze historical sales and expense data alongside the financial analyst's findings.
Generate realistic quarterly projections for the next 2 quarters and a 6-month forecast.
If losses are detected, provide specific, actionable recovery strategies (reduce dead inventory, optimize pricing, change logistics paths, add trending products, reduce operational cost).
Identify risk factors and provide confidence levels.
Be precise with numbers — base projections on actual growth rates and seasonality patterns from the data.`;

  const userPrompt = `Historical Sales Data:
${JSON.stringify(salesData, null, 2)}

Historical Expenses Data:
${JSON.stringify(expensesData, null, 2)}

Financial Analyst Findings:
${JSON.stringify(analystOutput, null, 2)}

Generate comprehensive revenue forecasting with quarterly projections, 6-month outlook, risk factors, and recovery strategies if needed.`;

  return runAgentStructured<ForecastOutput>(
    'analyst', // using analyst role for logging since our AgentRole type is fixed
    systemPrompt,
    userPrompt,
    forecastSchema,
    { businessId, data: { salesCount: salesData.length, expensesCount: expensesData.length } }
  );
}
