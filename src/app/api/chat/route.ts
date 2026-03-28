import { runConversationalAgent } from '@/agents/conversationalAgent';

export async function POST(req: Request) {
  try {
    const { messages, businessId } = await req.json();

    if (!businessId) {
      return new Response('businessId is required', { status: 400 });
    }

    const text = await runConversationalAgent(messages, businessId);
    return new Response(JSON.stringify({ text }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err: any) {
    console.error("AI SERVER ERROR:", err);
    return new Response(
      JSON.stringify({ 
        error: "AI_ERROR", 
        message: err.message || String(err),
        stack: err.stack
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
