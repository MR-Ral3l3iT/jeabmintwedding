import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { webhook } from '@line/bot-sdk';
import { LineService } from './line.service';

@ApiExcludeController()
@Controller('line')
export class LineController {
  constructor(private readonly lineService: LineService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: { rawBody?: Buffer; body: webhook.CallbackRequest },
    @Headers('x-line-signature') signature: string | undefined,
    @Body() body: webhook.CallbackRequest,
  ): Promise<{ ok: true }> {
    const rawBody = req.rawBody;
    if (!rawBody || !this.lineService.verifySignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid LINE signature');
    }

    const events = body.events ?? [];
    // Respond quickly; process async
    void this.lineService.handleEvents(events);
    return { ok: true };
  }
}
