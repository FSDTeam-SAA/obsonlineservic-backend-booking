import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'guest@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
