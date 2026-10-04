import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiScanService } from './ai-scan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScanImageDto } from './dto/scan-image.dto';

@UseGuards(JwtAuthGuard)
@Controller('ai-scan')
export class AiScanController {
  constructor(private readonly aiScan: AiScanService) {}

  // Body: { imageBase64, mimeType } — a menu photo or a single product photo.
  // Returns draft items for the owner to review before saving — never auto-publishes.
  // See docs/04-flow-diagrams.md §2.
  @Post('menu')
  scanMenu(@Body() dto: ScanImageDto) {
    return this.aiScan.extractItemsFromImage(dto.imageBase64, dto.mimeType);
  }
}
