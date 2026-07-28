
import { IReviewContributor, ContributorContext, ContributorState } from '../sdk/ContributorContext';

export class InProcessContributorHost {
  async executeAgent(agent: IReviewContributor, context: ContributorContext): Promise<any> {
    try {
      // Manage timeout and lifecycle states (PENDING -> RUNNING -> COMPLETED)
      const result = await agent.execute(context);
      return result;
    } catch (err) {
      return { status: 'FAILED', error: err };
    }
  }
}
