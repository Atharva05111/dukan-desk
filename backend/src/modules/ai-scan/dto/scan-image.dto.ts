import { IsBase64, IsIn, IsString } from 'class-validator';

export class ScanImageDto {
  // The photo itself, base64-encoded (the phone sends bytes — the server can't
  // open a file:// path that only exists on the phone).
  @IsString()
  @IsBase64()
  imageBase64: string;

  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
  mimeType: string;
}
