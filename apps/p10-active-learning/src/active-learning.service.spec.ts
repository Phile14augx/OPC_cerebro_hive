import { Test, TestingModule } from '@nestjs/testing';
import { ActiveLearningService } from './active-learning.service';

import { CampaignService } from './campaign.service';
import { AnnotationTaskService } from './annotation-task.service';

describe('ActiveLearningService', () => {
  let service: ActiveLearningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActiveLearningService,
        { provide: CampaignService, useValue: {} },
        { provide: AnnotationTaskService, useValue: {} },
      ],
    }).compile();

    service = module.get<ActiveLearningService>(ActiveLearningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return campaign status', () => {
    // Test-First: test the getCampaignStatus method
    expect(service.getCampaignStatus('123')).toBe('active');
  });
});
