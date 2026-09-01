import { Module } from '@nestjs/common';
import { ReportsModule } from '../reports/reports.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';

@Module({
  imports: [ReportsModule], // reuse the P&L engine — never let the AI compute its own numbers
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
