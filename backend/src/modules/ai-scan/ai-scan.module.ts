import { Module } from '@nestjs/common';
import { AiScanController } from './ai-scan.controller';
import { AiScanService } from './ai-scan.service';

@Module({
  controllers: [AiScanController],
  providers: [AiScanService],
})
export class AiScanModule {}
