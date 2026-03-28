import { z } from 'zod';
import { runAgentStructured } from './baseAgent';

export const inventorySchema = z.object({
  restockSuggestions: z.array(z.object({
    itemName: z.string(),
    sku: z.string(),
    suggestedQuantity: z.number(),
    reasoning: z.string()
  })).describe("List of items to restock with quantities and reasons"),
  deadStockAlerts: z.array(z.object({
    itemName: z.string(),
    reasoning: z.string()
  })).describe("Items that are not selling well and should be reduced"),
  demandPrediction: z.string().describe("Overall prediction of upcoming inventory demand trends")
});

export type InventoryOutput = z.infer<typeof inventorySchema>;

export async function runInventoryAgent(businessId: string, inventoryData: any[], recentSales: any[]) {
  const systemPrompt = `You are a Supply Chain and Inventory Intelligence Expert.
Analyze the provided current inventory levels and recent sales data.
Predict future demand based on sales velocity.
Identify items that are below or near their reorder threshold and suggest restock quantities.
Identify 'dead stock' items that have high quantity but low or zero recent sales.
Provide your reasoning for suggestions.`;

  const userPrompt = `Current Inventory Data:
${JSON.stringify(inventoryData, null, 2)}

Recent Sales Data (Last 30 Days):
${JSON.stringify(recentSales, null, 2)}

Provide your inventory intelligence report.`;

  return runAgentStructured<InventoryOutput>(
    'inventory',
    systemPrompt,
    userPrompt,
    inventorySchema,
    { businessId, data: null }
  );
}
