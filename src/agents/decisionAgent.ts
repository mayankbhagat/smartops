import { z } from 'zod';
import { runAgentStructured, AgentRole } from './baseAgent';

export const decisionSchema = z.object({
  executiveSummary: z.string().describe("A high-level summary of the business's current state and strategy"),
  healthScore: z.number().min(0).max(100).describe("Overall business health score from 0 to 100"),
  criticalAlerts: z.array(z.string()).describe("Urgent issues that require immediate attention (e.g., severe stockouts, cash flow issues)"),
  strategicRecommendations: z.array(z.object({
    category: z.enum(['Finance', 'Inventory', 'Logistics', 'General']),
    action: z.string(),
    impact: z.enum(['High', 'Medium', 'Low'])
  })).describe("Prioritized list of recommendations"),
  nextSteps: z.array(z.string()).describe("Immediate next steps for the business owner")
});

export type DecisionOutput = z.infer<typeof decisionSchema>;

export async function runDecisionAgent(
  businessId: string, 
  analystOutput: any, 
  inventoryOutput: any, 
  logisticsOutput: any
) {
  const systemPrompt = `You are the Master AI Executive Decision Maker for an advanced Business Operating System.
Your job is to synthesize data from the Financial Analyst, Inventory Intelligence, and Logistics Agents.
Produce an overarching executive summary, an overall business health score out of 100, identify critical alerts, and formulate strategic, prioritized recommendations.
Be highly insightful and actionable.`;

  const userPrompt = `Financial Analyst Output:
${JSON.stringify(analystOutput, null, 2)}

Inventory Intelligence Output:
${JSON.stringify(inventoryOutput, null, 2)}

Logistics Output:
${JSON.stringify(logisticsOutput, null, 2)}

Please provide your final executive decision report.`;

  return runAgentStructured<DecisionOutput>(
    'decision',
    systemPrompt,
    userPrompt,
    decisionSchema,
    { businessId, data: null }
  );
}
