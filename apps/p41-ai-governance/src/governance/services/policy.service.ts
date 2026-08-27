import { Injectable } from '@nestjs/common';
import { IOpaPolicyEvaluationRequest, IOpaPolicyEvaluationResponse } from '../interfaces/opa-policy.interface';

@Injectable()
export class PolicyService {
  evaluatePolicy(request: IOpaPolicyEvaluationRequest): IOpaPolicyEvaluationResponse {
    if (request.action === 'deploy_model') {
      if (request.context?.riskLevel === 'high' && !request.context?.humanApproved) {
        return {
          allowed: false,
          reason: 'High risk models require human approval',
          policyViolations: ['risk-policy-001']
        };
      }
      return { allowed: true };
    }

    if (request.action === 'escalate_budget') {
      return {
        allowed: false,
        reason: 'Budget escalation required',
        policyViolations: ['escalation-needed']
      };
    }

    return { allowed: false, reason: 'Unknown action or default deny' };
  }
}
