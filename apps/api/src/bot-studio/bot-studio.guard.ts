import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  BOT_STUDIO_COOKIE,
  parseCookieHeader,
  verifySessionToken,
} from './bot-studio.session';

@Injectable()
export class BotStudioGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = parseCookieHeader(req.headers.cookie, BOT_STUDIO_COOKIE);
    if (!verifySessionToken(token)) {
      throw new UnauthorizedException('ต้องเข้าสู่ระบบ Bot Studio ก่อน');
    }
    return true;
  }
}
