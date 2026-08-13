import type { IndustryBrief, IndustryModelProposal } from '@cerebro/twin-contracts';

export interface IndustryModelProvider {
  generate(brief: IndustryBrief): IndustryModelProposal;
}
