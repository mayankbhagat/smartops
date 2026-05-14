import { z } from 'zod';
import { runAgentStructured } from './baseAgent';

export const sustainabilitySchema = z.object({
  carbonFootprint: z.object({
    totalKgCO2: z.number().describe("Total estimated CO2 emissions in kg"),
    perShipmentAvg: z.number().describe("Average CO2 per shipment in kg"),
    trend: z.enum(['increasing', 'stable', 'decreasing']),
  }),
  sustainabilityScore: z.number().min(0).max(100).describe("Overall sustainability score 0-100"),
  greenRecommendations: z.array(z.object({
    recommendation: z.string(),
    co2SavingsKg: z.number(),
    costImpact: z.enum(['saves_money', 'neutral', 'small_increase']),
    implementationDifficulty: z.enum(['easy', 'moderate', 'complex']),
  })).describe("Specific green logistics recommendations"),
  ecoAlternatives: z.array(z.object({
    currentMethod: z.string(),
    greenAlternative: z.string(),
    co2Reduction: z.string(),
    feasibility: z.string(),
  })).describe("Eco-friendly transport alternatives"),
  treesEquivalent: z.number().describe("CO2 offset equivalent in trees planted"),
  summary: z.string().describe("Sustainability executive summary"),
});

export type SustainabilityOutput = z.infer<typeof sustainabilitySchema>;

export async function runSustainabilityAgent(businessId: string, logisticsData: any[], logisticsOutput: any) {
  const systemPrompt = `You are a Sustainability and Environmental Impact AI Expert.
Analyze logistics and delivery data to calculate carbon footprint, sustainability metrics, and eco-friendly alternatives.
Provide specific, actionable green logistics recommendations with quantified CO2 savings.
Calculate the tree-planting equivalent of the current carbon footprint.
Be data-driven and practical — focus on changes that businesses can realistically implement.`;

  const userPrompt = `Logistics Data:
${JSON.stringify(logisticsData, null, 2)}

Logistics Optimization Output:
${JSON.stringify(logisticsOutput, null, 2)}

Provide comprehensive sustainability analysis with carbon footprint, eco score, green recommendations, and alternatives.`;

  return runAgentStructured<SustainabilityOutput>(
    'logistics', // using logistics role for logging
    systemPrompt,
    userPrompt,
    sustainabilitySchema,
    { businessId, data: null }
  );
}
