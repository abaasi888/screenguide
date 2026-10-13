import { z } from 'zod';

export const StepSchema = z.object({
  order: z.number(),
  instruction: z.string(),
  start: z.number(),
  end: z.number(),
  frame: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});

export const DiscardedSchema = z.object({
  instruction: z.string(),
  reason: z.string(),
});

export const MissingSchema = z.object({
  step: z.string(),
  reason: z.string(),
});

export const GuideSchema = z.object({
  steps: z.array(StepSchema),
  discarded: z.array(DiscardedSchema),
  missing: z.array(MissingSchema),
  final_settings: z.record(z.string(), z.string()),
});

export type Guide = z.infer<typeof GuideSchema>;
export type Step = z.infer<typeof StepSchema>;