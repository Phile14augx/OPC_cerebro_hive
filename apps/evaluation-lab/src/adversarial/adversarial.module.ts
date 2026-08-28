import { Module } from '@nestjs/common';
import { AdversarialController } from './adversarial.controller';
import { AdversarialService } from './adversarial.service';

@Module({
  controllers: [AdversarialController],
  providers: [AdversarialService],
  exports: [AdversarialService],
})
export class AdversarialModule {}
