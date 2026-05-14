import { z } from 'zod';
import { runAgentStructured } from './baseAgent';

export const logisticsSchema = z.object({
  optimizedRoutes: z.array(z.object({
    clusterName: z.string(),
    deliveriesIncluded: z.array(z.string()).describe("IDs or Names of deliveries in this route"),
    estimatedFuelCost: z.number(),
    carbonEmissionsKg: z.number().describe("Estimated carbon footprint of this route in kg"),
    reasoning: z.string()
  })).describe("Suggested clustered routes for efficiency"),
  totalEstimatedSavings: z.number().describe("Estimated cost savings by using these routes compared to individual trips"),
  sustainabilityScore: z.number().min(0).max(100).describe("0-100 score of how eco-friendly the current logistics setup is"),
  carbonSavedKg: z.number().describe("Estimated kg of CO2 saved through optimization"),
  recommendations: z.array(z.string()).describe("Actionable logistics recommendations including eco-friendly steps")
});

export type LogisticsOutput = z.infer<typeof logisticsSchema>;

export async function runLogisticsAgent(businessId: string, pendingDeliveries: any[]) {
  const systemPrompt = `You are an expert Logistics, Route Optimization, and Sustainability AI.
Analyze the provided pending deliveries.
Group them logically based on proximity or route efficiency to minimize distance, fuel cost, and carbon emissions.
Calculate the estimated carbon footprint (kg CO2) and fuel cost for the new optimized routes.
Provide a sustainability score out of 100 based on the route efficiency.
Give actionable recommendations for the delivery team.`;

  const userPrompt = `Pending Deliveries:
${JSON.stringify(pendingDeliveries, null, 2)}

Provide your optimized logistics plan based on these deliveries.`;

  return runAgentStructured<LogisticsOutput>(
    'logistics',
    systemPrompt,
    userPrompt,
    logisticsSchema,
    { businessId, data: null }
  );
}
