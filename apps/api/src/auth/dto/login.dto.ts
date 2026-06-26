import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@jeabmint.com' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @ApiProperty({ example: 'Admin@1234' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  password: string;
}
