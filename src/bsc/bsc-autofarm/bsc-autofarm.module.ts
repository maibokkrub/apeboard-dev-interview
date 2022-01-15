import { Module } from '@nestjs/common';
import { BscAutofarmService } from './bsc-autofarm.service';
import { BscAutofarmController } from './bsc-autofarm.controller';

@Module({
  providers: [BscAutofarmService],
  controllers: [BscAutofarmController]
})
export class BscAutofarmModule {}
