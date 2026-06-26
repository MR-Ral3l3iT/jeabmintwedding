import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * ตรวจสอบ credentials และออก JWT
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const payload = { sub: admin.id, email: admin.email };
    const accessToken = this.jwt.sign(payload);

    return { accessToken, adminEmail: admin.email };
  }
}
