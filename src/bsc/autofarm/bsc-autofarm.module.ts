import { Module } from '@nestjs/common';
import { BscAutofarmService } from './bsc-autofarm.service';
import { BscAutofarmController } from './bsc-autofarm.controller';
import { CoreBscModule } from 'src/core-bsc/core-bsc.module';

@Module({
  imports: [CoreBscModule], 
  providers: [BscAutofarmService],
  controllers: [BscAutofarmController]
})
export class BscAutofarmModule {}
