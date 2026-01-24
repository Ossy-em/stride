import { Opik } from 'opik';

// Initialize Opik in local mode (no API key needed)
// const opik = new Opik({
//   projectName: 'stride-hackathon',
//   // Local mode - stores data in SQLite database
// });

// Simple in-memory store for traces (fallback if Opik fails)
// Simple logging without external dependencies
const traces: any[] = [];

export async function logAICall(params: {
  name: string;
  input: any;
  output: any;
  model: string;
  startTime: number;
  endTime: number;
  metadata?: Record<string, any>;
  tags?: string[];
}) {
  try {
    const { name, input, output, model, startTime, endTime, metadata, tags } = params;

    const latency = endTime - startTime;

    const trace = {
      id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      input,
      output,
      model,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      latency_ms: latency,
      metadata: metadata || {},
      tags: tags || [],
    };

    // Store in memory
    traces.push(trace);

    console.log(`✅ Logged: ${name} (${latency}ms) | Tokens: in=${metadata?.input_tokens || 'N/A'} out=${metadata?.output_tokens || 'N/A'}`);
    
    return trace.id;
  } catch (error) {
    console.error('❌ Logging failed:', error);
    return null;
  }
}

export async function logEvaluation(params: {
  name: string;
  traceId: string;
  score: number;
  metadata?: Record<string, any>;
}) {
  try {
    const { name, traceId, score, metadata } = params;

    const evaluation = {
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'evaluation',
      name,
      traceId,
      score,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    traces.push(evaluation);

    console.log(`📊 Evaluation: ${name} = ${score}`);
    
    return evaluation.id;
  } catch (error) {
    console.error('❌ Evaluation logging failed:', error);
    return null;
  }
}

// Get all traces (for export/analysis)
export function getTraces() {
  return traces;
}

// Get summary statistics
export function getTraceSummary() {
  const aiCalls = traces.filter(t => t.name && !t.type);
  const evaluations = traces.filter(t => t.type === 'evaluation');
  
  const avgLatency = aiCalls.length > 0
    ? aiCalls.reduce((sum, t) => sum + (t.latency_ms || 0), 0) / aiCalls.length
    : 0;

  const totalTokens = aiCalls.reduce((sum, t) => {
    const inputTokens = t.metadata?.input_tokens || 0;
    const outputTokens = t.metadata?.output_tokens || 0;
    return sum + inputTokens + outputTokens;
  }, 0);

  return {
    totalCalls: aiCalls.length,
    totalEvaluations: evaluations.length,
    avgLatencyMs: Math.round(avgLatency),
    totalTokens,
    callsByType: aiCalls.reduce((acc: any, t) => {
      acc[t.name] = (acc[t.name] || 0) + 1;
      return acc;
    }, {}),
  };
}

// For backwards compatibility
export const opik = {
  trace: logAICall,
  logFeedback: logEvaluation,
};