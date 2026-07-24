export interface PostImplementationReview {
  pirId: string;
  changeRequestId: string;
  
  reviewerId: string;
  reviewedAt: Date;
  
  objectivesAchieved: boolean;
  issuesEncountered: string;
  
  rollbackRequired: boolean;
  rollbackReason?: string;
  
  lessonsLearned: string;
  followUpActions: string[];
}
