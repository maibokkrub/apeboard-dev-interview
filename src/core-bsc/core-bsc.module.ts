import { Module } from '@nestjs/common';
import { CoreBscService } from './core-bsc.service';
import { CoreBscController } from './core-bsc.controller';

@Module({
  providers: [CoreBscService],
  controllers: [CoreBscController]
})
export class CoreBscModule {}
