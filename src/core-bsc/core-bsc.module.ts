import { Module } from '@nestjs/common';
import { CoreBscService } from './core-bsc.service';

@Module({
  providers: [CoreBscService],
  exports: [CoreBscModule, CoreBscService], 
})
export class CoreBscModule {}
