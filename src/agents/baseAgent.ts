import { generateObject, generateText } from 'ai';
import { google as defaultGoogle, createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export type AgentRole = 'ingestion' | 'analyst' | 'inventory' | 'logistics' | 'decision' | 'conversational';

export interface AgentContext {
  businessId: string;
  data: any;
}

export const runAgentText = async (
  agentName: AgentRole,
  systemPrompt: string,
  userPrompt: string,
  context: AgentContext
) => {
  const startTime = Date.now();
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: userPrompt,
    });

    const executionTimeMs = Date.now() - startTime;
    
    // Log Agent execution to database asynchronously
    await logAgentExecution(
      context.businessId,
      agentName,
      'completed',
      { prompt: userPrompt },
      { text },
      'Successfully generated text',
      executionTimeMs
    );

    return text;
  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    await logAgentExecution(
      context.businessId,
      agentName,
      'failed',
      { prompt: userPrompt },
      { error: error.message },
      'Failed generation',
      executionTimeMs
    );
    throw error;
  }
};

export const runAgentStructured = async <T>(
  agentName: AgentRole,
  systemPrompt: string,
  userPrompt: string,
  schema: any, // Zod schema
  context: AgentContext
): Promise<T> => {
   const startTime = Date.now();
   try {
     const { object } = await generateObject({
       model: google('gemini-1.5-flash'),
       system: systemPrompt,
       prompt: userPrompt,
       schema: schema,
     });

     const executionTimeMs = Date.now() - startTime;
     
     await logAgentExecution(
       context.businessId,
       agentName,
       'completed',
       { prompt: userPrompt },
       object,
       'Successfully generated structured object',
       executionTimeMs
     );
 
     return object as T;
   } catch (error: any) {
     const executionTimeMs = Date.now() - startTime;
     await logAgentExecution(
       context.businessId,
       agentName,
       'failed',
       { prompt: userPrompt },
       { error: error.message },
       'Failed structured generation',
       executionTimeMs
     );
     throw error;
   }
}

// Utility to write agent actions into our logs table for UI visualization
async function logAgentExecution(
  businessId: string,
  agentName: AgentRole,
  status: string,
  inputData: any,
  outputData: any,
  reasoning: string,
  executionTimeMs: number
) {
  await supabase.from('agent_logs').insert({
    business_id: businessId,
    agent_name: agentName,
    status,
    input_data: inputData,
    output_data: outputData,
    reasoning,
    execution_time_ms: executionTimeMs
  });
}
