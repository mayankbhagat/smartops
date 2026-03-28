import { NextResponse } from 'next/server';
import { runFullAgenticPipeline } from '@/agents/orchestrator';

export async function POST(req: Request) {
  try {
    const { businessId, action } = await req.json();

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId is required' }, { status: 400 });
    }

    if (action === 'run_full_pipeline') {
      const result = await runFullAgenticPipeline(businessId);
      if (result.success) {
        return NextResponse.json(result);
      } else {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
      }
    }

    // Add specific agent executions here if needed
    // e.g. action === 'run_analyst'

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
