export type MessageVariant = 'direct' | 'question' | 'challenge';
export type TimingOffset = 2 | 5 | 8;

export interface ABTestVariant {
  variantType: MessageVariant;
  timingOffset: TimingOffset;
}


export function assignVariant(): ABTestVariant {
  const variants: MessageVariant[] = ['direct', 'question', 'challenge'];
  const timingOffsets: TimingOffset[] = [2, 5, 8];
  
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];
  const randomTiming = timingOffsets[Math.floor(Math.random() * timingOffsets.length)];
  
  return {
    variantType: randomVariant,
    timingOffset: randomTiming
  };
}

export function applyTimingOffset(
  basePredictedMinutes: number,
  timingOffset: TimingOffset
): number {
  // Intervene X minutes BEFORE the predicted drop time
  return Math.max(1, basePredictedMinutes - timingOffset);
}


export function applyVariantStyle(
  basePrompt: string,
  variant: MessageVariant
): string {
  const styleInstructions = {
    direct: `
STYLE OVERRIDE - Use DIRECT tone:
- Give clear instructions
- State facts confidently
- Use imperative language ("Take a break", "Stop now")
- Be authoritative but caring`,
    
    question: `
STYLE OVERRIDE - Use QUESTION tone:
- Ask questions instead of stating
- Make user reflect ("How's your focus?", "Need a break?")
- Be curious and gentle
- Let user decide`,
    
    challenge: `
STYLE OVERRIDE - Use CHALLENGE tone:
- Acknowledge their progress
- Frame continuing as achievement
- Be motivating ("You're at 40 mins - can you hit 50?")
- Encourage pushing through`
  };

  return `${basePrompt}

${styleInstructions[variant]}

Apply this style to your intervention message.`;
}

/**
 * Calculate A/B test statistics from interventions
 */
export interface ABTestStats {
  variantType: MessageVariant;
  timingOffset: TimingOffset;
  totalInterventions: number;
  effectiveCount: number;
  effectivenessRate: number;
}

export function calculateABTestStats(interventions: any[]): ABTestStats[] {
  const grouped = new Map<string, any[]>();
  
  interventions.forEach(intervention => {
    if (!intervention.variant_type || !intervention.timing_offset) return;
    
    const key = `${intervention.variant_type}-${intervention.timing_offset}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(intervention);
  });
  
  const stats: ABTestStats[] = [];
  grouped.forEach((group, key) => {
    const [variantType, timingOffset] = key.split('-');
    const effectiveInterventions = group.filter(i => i.effective === true);
    
    stats.push({
      variantType: variantType as MessageVariant,
      timingOffset: parseInt(timingOffset) as TimingOffset,
      totalInterventions: group.length,
      effectiveCount: effectiveInterventions.length,
      effectivenessRate: group.length > 0 
        ? (effectiveInterventions.length / group.length) * 100 
        : 0
    });
  });
  
  return stats.sort((a, b) => b.effectivenessRate - a.effectivenessRate);
}
