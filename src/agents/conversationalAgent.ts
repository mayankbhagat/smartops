// @ts-nocheck
import { google as defaultGoogle, createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, tool } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// This function acts as a standard Chat handler utilizing tools (RAG-lite)
export async function runConversationalAgent(messages: any[], businessId: string) {
  // Retrieve recent context from DB to enrich the system prompt
  const { data: insights } = await supabase
    .from('insights')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(5);

  const contextStr = insights ? JSON.stringify(insights) : "No recent insights available.";

  const result = await generateText({
    model: google('gemini-2.5-flash'),
    system: `You are the SmartOps AI Copilot for this business.
Your goal is to answer questions based on the latest business insights and logs.
Be extremely concise, professional, and helpful.

Recent Business Insights Context:
${contextStr}
`,
    messages,
    tools: {
      getMetric: tool({
        description: 'Get a specific business metric (e.g., revenue, critical alerts)',
        parameters: z.object({ metricName: z.string() }),
        execute: async (args: any) => "The estimated current metric looks healthy."
      }) as any
    }
  });

  return result.text;
}
