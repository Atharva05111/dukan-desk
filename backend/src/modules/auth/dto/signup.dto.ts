import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { BusinessType } from '@prisma/client';

export class SignupDto {
  @IsString()
  @MinLength(2)
  businessName: string;

  @IsEnum(BusinessType)
  businessType: BusinessType;

  @Matches(/^\+?[0-9]{10,15}$/, { message: 'phone must be a valid 10-15 digit number' })
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;
}
