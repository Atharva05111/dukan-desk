import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'phone must be a valid 10-15 digit number' })
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;
}
