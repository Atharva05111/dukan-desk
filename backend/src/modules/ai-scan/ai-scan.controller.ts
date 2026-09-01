import { Body, Controller, Post } from '@nestjs/common';
import { AiScanService } from './ai-scan.service';

@Controller('ai-scan')
export class AiScanController {
  constructor(private readonly aiScan: AiScanService) {}

  // Body: { imageUrl } (image already uploaded to S3 by the mobile client)
  // Returns draft items for the owner to review before saving — never auto-publishes.
  // See docs/04-flow-diagrams.md §2.
  @Post('menu')
  scanMenu(@Body() dto: { imageUrl: string }) {
    return this.aiScan.extractMenuFromImage(dto.imageUrl);
  }
}
