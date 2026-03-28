import { supabase } from '@/lib/supabase';
import { runAnalystAgent } from './analystAgent';
import { runInventoryAgent } from './inventoryAgent';
import { runLogisticsAgent } from './logisticsAgent';
import { runDecisionAgent } from './decisionAgent';

export async function runFullAgenticPipeline(businessId: string) {
  try {
    // 1. Fetch data required by agents
    const [
      { data: sales },
      { data: expenses },
      { data: inventory },
      { data: deliveries }
    ] = await Promise.all([
      supabase.from('sales').select('*').eq('business_id', businessId).order('transaction_date', { ascending: false }).limit(100),
      supabase.from('expenses').select('*').eq('business_id', businessId).order('expense_date', { ascending: false }).limit(50),
      supabase.from('inventory').select('*').eq('business_id', businessId),
      supabase.from('deliveries').select('*').eq('business_id', businessId).eq('status', 'pending')
    ]);

    // 2. Run Sub-Agents in Parallel taking advantage of independent schemas
    console.log("Starting sub-agents...");
    const [analystResult, inventoryResult, logisticsResult] = await Promise.all([
      runAnalystAgent(businessId, sales || [], expenses || []),
      runInventoryAgent(businessId, inventory || [], sales || []),
      runLogisticsAgent(businessId, deliveries || [])
    ]);

    // 3. Run Master Decision Agent sequentially after sub-agents complete
    console.log("Starting master decision agent...");
    const decisionResult = await runDecisionAgent(businessId, analystResult, inventoryResult, logisticsResult);

    // 4. Save Final Master Insight to DB
    await supabase.from('insights').insert({
      business_id: businessId,
      insight_type: 'executive_summary',
      title: 'Global Business Strategy & Health Report',
      description: decisionResult.executiveSummary,
      data: decisionResult,
      action_items: decisionResult.strategicRecommendations
    });

    return { success: true, decisionResult, analystResult, inventoryResult, logisticsResult };

  } catch (error: any) {
    console.error('Pipeline Error:', error);
    return { success: false, error: error.message };
  }
}
