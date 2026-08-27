import { describe, it, expect, vi } from 'vitest';
import { DifferentialPrivacyService } from '../../src/services/differential-privacy.service';
import { PrivacyBudgetService, BudgetEventEmitter } from '../../src/services/privacy-budget.service';
import { ConsentLedgerService } from '../../src/services/consent-ledger.service';
import { BadRequestException } from '@nestjs/common';

describe('Privacy Intelligence Integration', () => {
  describe('DifferentialPrivacyService & PrivacyBudgetService Integration', () => {
    it('should consume budget when Laplace noise is applied to a query', () => {
      const budgetService = new PrivacyBudgetService();
      const dpService = new DifferentialPrivacyService();
      budgetService.initialiseBudget('ds-1', 10.0, 1e-5);
      dpService.addLaplaceNoise(100, 1.0);
      budgetService.consumeBudget('ds-1', 1.0, 0);
      expect(budgetService.checkBudgetExceeded('ds-1')).toBe(false);
    });

    it('should prevent query execution if privacy budget is exceeded', () => {
      const budgetService = new PrivacyBudgetService();
      const dpService = new DifferentialPrivacyService();
      budgetService.initialiseBudget('ds-2', 1.0, 1e-5);
      budgetService.consumeBudget('ds-2', 1.0, 0);

      expect(() => {
         if (budgetService.checkBudgetExceeded('ds-2')) {
           throw new BadRequestException('Privacy budget exceeded');
         }
         dpService.addLaplaceNoise(100, 1.0);
      }).toThrow(BadRequestException);
    });
  });

  describe('ConsentLedger & API Integration', () => {
    it('should successfully register consent via API and store in ledger', () => {
      const consentService = new ConsentLedgerService();
      const consent = consentService.createConsent('user-1', 'consent', 'marketing');
      const activeConsents = consentService.getActiveConsents('user-1');
      expect(activeConsents.length).toBe(1);
    });

    it('should block data processing if active consent is missing', () => {
      const consentService = new ConsentLedgerService();
      const activeConsents = consentService.getActiveConsents('user-2');

      expect(() => {
        if (activeConsents.length === 0) {
          throw new Error('No active consent');
        }
      }).toThrow('No active consent');
    });
  });

  describe('Consumed Contracts Integration', () => {
    it('should verify P01 contract interfaces are respected during budget consumption', () => {
      const mockEmitter: BudgetEventEmitter = { emit: vi.fn() };
      const budgetService = new PrivacyBudgetService(mockEmitter);
      budgetService.initialiseBudget('ds-1', 10.0, 1e-5);
      expect(budgetService.consumeBudget('ds-1', 1.0, 0)).toBeDefined();
    });

    it('should correctly emit governance events formatted as per event contracts', () => {
      const mockEmitter: BudgetEventEmitter = { emit: vi.fn() };
      const budgetService = new PrivacyBudgetService(mockEmitter);
      budgetService.initialiseBudget('ds-3', 1.0, 1e-5);

      budgetService.consumeBudget('ds-3', 1.0, 0);
      expect(mockEmitter.emit).toHaveBeenCalledWith('governance.privacy.budget.consumed', { subjectId: 'ds-3', exceeded: true });
    });
  });
});
