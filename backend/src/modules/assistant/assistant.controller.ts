import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-payload';

@UseGuards(JwtAuthGuard)
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  // businessId comes from the authenticated staff member's token, never the client —
  // see the multi-tenancy warning in assistant.service.ts.
  @Post('query')
  query(@CurrentUser() user: JwtPayload, @Body() dto: { question: string }) {
    return this.assistant.answer(user.businessId, dto.question);
  }
}
