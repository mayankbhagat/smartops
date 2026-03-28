import { generateText } from 'ai';
import { google as defaultGoogle, createGoogleGenerativeAI } from '@ai-sdk/google';
import { mockInventory, mockFinancials, mockLogisticsEvents } from '@/data/mockData';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    let csvData = null;
    try {
      const body = await req.json();
      csvData = body.csvData;
    } catch (e) {
      // Ignore empty body
    }

    const dataContext = csvData 
      ? `USER UPLOADED CSV DATA (Prioritize analyzing this data):\n${csvData}\n\nFallback synthetic data for context:`
      : `SYNTHETIC BASELINE DATA:`;

    const systemPrompt = `You are an elite Business Strategy AI for SmartOps. 
Your task is to analyze the provided business dataset and generate a highly professional, extremely concise Executive Summary Report in formatted Markdown.
Highlight key risks, financial health, and supply chain anomalies. Provide 3 bullet-point actionable recommendations.

DATA ASSETS:
${dataContext}
Inventory: ${JSON.stringify(mockInventory)}
Financials: ${JSON.stringify(mockFinancials)}
Logistics Events: ${JSON.stringify(mockLogisticsEvents)}
`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: "Generate the Executive Strategy Summary.",
    });

    return new Response(JSON.stringify({ report: text }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error("REPORT GENERATION ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
