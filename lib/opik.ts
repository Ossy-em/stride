import { Opik } from 'opik';

// Initialize Opik with API key
const opik = new Opik({
  projectName: process.env.OPIK_PROJECT_NAME || 'stride-hackathon',
  apiKey: process.env.OPIK_API_KEY,
});

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

    // Log to Opik
    await opik.trace({
      name,
      input,
      output,
      metadata: {
        model,
        latency_ms: latency,
        ...metadata,
      },
      tags: tags || [],
    });

    console.log(`✅ Logged: ${name} (${latency}ms) | Tokens: in=${metadata?.input_tokens || 'N/A'} out=${metadata?.output_tokens || 'N/A'}`);
    
    return `trace_${Date.now()}`;
  } catch (error) {
    console.error('❌ Opik logging failed:', error);
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

    // Log evaluation to Opik using correct method
    await opik.log({
      name,
      type: 'evaluation',
      traceId,
      score,
      metadata,
    });

    console.log(`📊 Evaluation: ${name} = ${score}`);
    
    return `eval_${Date.now()}`;
  } catch (error) {
    console.error('❌ Opik evaluation logging failed:', error);
    return null;
  }
}
export { opik };