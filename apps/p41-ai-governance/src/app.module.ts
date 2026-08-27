import { Module } from '@nestjs/common';
import { GovernanceModule } from './governance/governance.module';

@Module({
  imports: [GovernanceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
