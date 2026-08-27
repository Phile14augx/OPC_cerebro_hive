import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DifferentialPrivacyService } from './services/differential-privacy.service';
import { ConsentLedgerService } from './services/consent-ledger.service';
import { PrivacyBudgetService } from './services/privacy-budget.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    DifferentialPrivacyService,
    ConsentLedgerService,
    PrivacyBudgetService
  ],
})
export class AppModule {}
