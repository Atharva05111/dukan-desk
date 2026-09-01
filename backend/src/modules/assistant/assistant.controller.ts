import { Body, Controller, Post } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  @Post('query')
  query(@Body() dto: { businessId: string; question: string }) {
    return this.assistant.answer(dto.businessId, dto.question);
  }
}
