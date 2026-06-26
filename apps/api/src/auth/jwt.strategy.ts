import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-jwt-secret',
    });
  }

  validate(payload: JwtPayload): { adminId: string; email: string } {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException();
    }
    return { adminId: payload.sub, email: payload.email };
  }
}
