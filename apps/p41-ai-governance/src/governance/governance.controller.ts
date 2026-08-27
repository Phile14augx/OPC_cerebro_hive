import { Controller, Post, Body } from '@nestjs/common';
import { GovernanceService } from './governance.service';

@Controller('api/v1/governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Post('policies/evaluate')
  evaluatePolicy(@Body() body: any) {
    return this.governanceService.evaluatePolicy(body);
  }

  @Post('approvals')
  requestApproval(@Body() body: any) {
    return this.governanceService.requestApproval(body);
  }

  @Post('models/cards')
  registerModelCard(@Body() body: any) {
    return this.governanceService.registerModelCard(body);
  }
}
