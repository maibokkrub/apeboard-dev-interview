import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreBscModule } from './core-bsc/core-bsc.module';
import { BscAutofarmModule } from './bsc/bsc-autofarm/bsc-autofarm.module';

@Module({
  imports: [CoreBscModule, BscAutofarmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
