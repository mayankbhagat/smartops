import { z } from 'zod';
import { runAgentStructured } from './baseAgent';

export const logisticsSchema = z.object({
  optimizedRoutes: z.array(z.object({
    clusterName: z.string(),
    deliveriesIncluded: z.array(z.string()).describe("IDs or Names of deliveries in this route"),
    estimatedFuelCost: z.number(),
    reasoning: z.string()
  })).describe("Suggested clustered routes for efficiency"),
  totalEstimatedSavings: z.number().describe("Estimated cost savings by using these routes compared to individual trips"),
  recommendations: z.array(z.string()).describe("Actionable logistics recommendations")
});

export type LogisticsOutput = z.infer<typeof logisticsSchema>;

export async function runLogisticsAgent(businessId: string, pendingDeliveries: any[]) {
  const systemPrompt = `You are an expert Logistics and Route Optimization AI.
Analyze the provided pending deliveries.
Group them logically based on proximity or route efficiency to minimize distance and fuel cost.
Provide an estimated fuel cost for the new optimized routes and calculate savings.
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
