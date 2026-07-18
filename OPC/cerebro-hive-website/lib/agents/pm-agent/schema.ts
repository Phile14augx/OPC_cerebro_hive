import { z } from "zod";

export const EpicDecompositionSchema = z.object({
  storyPoints: z.number().describe("Estimated story points using Fibonacci sequence (1, 2, 3, 5, 8, 13, 21)."),
  labels: z.array(z.string()).describe("Array of relevant GitHub labels (e.g., 'frontend', 'high-priority', 'phase:1')."),
  checklist: z.array(z.string()).describe("A comprehensive breakdown of technical tasks required to complete this epic."),
  dependencies: z.array(z.string()).describe("List of architectural or technical dependencies that must be resolved first."),
  riskLevel: z.enum(["low", "medium", "high"]).describe("Estimated technical risk of the epic."),
  suggestedPhase: z.string().describe("Which phase this epic should logically fall into based on dependencies."),
});

export type EpicDecomposition = z.infer<typeof EpicDecompositionSchema>;
