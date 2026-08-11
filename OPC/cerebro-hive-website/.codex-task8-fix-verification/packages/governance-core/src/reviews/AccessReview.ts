export interface AccessReviewCampaign {
  id: string;
  name: string;
  scope: 'All' | 'Department' | 'SpecificEntitlements';
  targetEntitlements?: string[];
  reviewerType: 'Manager' | 'ApplicationOwner' | 'Security';
  
  status: 'Draft' | 'Active' | 'Completed';
  createdAt: Date;
  deadlineAt: Date;
  
  autoRevocationPolicy: 'RevokeUnreviewed' | 'KeepUnreviewed';
}

export interface AccessReviewItem {
  id: string;
  campaignId: string;
  principalId: string;
  entitlementId: string;
  reviewerId: string;
  status: 'Pending' | 'Approved' | 'Revoked';
  decisionTimestamp?: Date;
  decisionComment?: string;
}

export class AccessReviewEngine {
  private items = new Map<string, AccessReviewItem>();

  createItem(item: AccessReviewItem) {
    this.items.set(item.id, item);
  }

  submitDecision(itemId: string, reviewerId: string, decision: 'Approved' | 'Revoked', comment?: string): AccessReviewItem {
    const item = this.items.get(itemId);
    if (!item) throw new Error('Review item not found');
    if (item.reviewerId !== reviewerId) throw new Error('Unauthorized reviewer');

    item.status = decision;
    item.decisionTimestamp = new Date();
    item.decisionComment = comment;

    return item;
  }
}
