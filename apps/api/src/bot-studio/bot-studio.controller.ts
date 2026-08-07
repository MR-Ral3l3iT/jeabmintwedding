import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BotStudioGuard } from './bot-studio.guard';
import { BotStudioService } from './bot-studio.service';
import {
  BotStudioLoginDto,
  CreateBotTopicDto,
  ReorderBotTopicsDto,
  UpdateBotPersonaDto,
  UpdateBotTopicDto,
} from './dto/bot-studio.dto';
import { buildSetCookie, createSessionToken } from './bot-studio.session';

@ApiTags('Bot Studio')
@Controller('bot-studio')
export class BotStudioController {
  constructor(private readonly botStudioService: BotStudioService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bot Studio password login' })
  login(
    @Body() dto: BotStudioLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.botStudioService.verifyPassword(dto.password);
    const token = createSessionToken();
    res.setHeader('Set-Cookie', buildSetCookie(token));
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bot Studio logout' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Set-Cookie', buildSetCookie('', true));
    return { ok: true };
  }

  @Get('session')
  @UseGuards(BotStudioGuard)
  @ApiOperation({ summary: 'Check Bot Studio session' })
  session() {
    return { ok: true };
  }

  @Get('persona')
  @UseGuards(BotStudioGuard)
  getPersona() {
    return this.botStudioService.getPersona();
  }

  @Put('persona')
  @UseGuards(BotStudioGuard)
  updatePersona(@Body() dto: UpdateBotPersonaDto) {
    return this.botStudioService.updatePersona(dto);
  }

  @Get('topics')
  @UseGuards(BotStudioGuard)
  listTopics() {
    return this.botStudioService.listTopics();
  }

  @Post('topics')
  @UseGuards(BotStudioGuard)
  createTopic(@Body() dto: CreateBotTopicDto) {
    return this.botStudioService.createTopic(dto);
  }

  @Patch('topics/reorder')
  @UseGuards(BotStudioGuard)
  reorderTopics(@Body() dto: ReorderBotTopicsDto) {
    return this.botStudioService.reorderTopics(dto);
  }

  @Patch('topics/:id')
  @UseGuards(BotStudioGuard)
  updateTopic(@Param('id') id: string, @Body() dto: UpdateBotTopicDto) {
    return this.botStudioService.updateTopic(id, dto);
  }

  @Delete('topics/:id')
  @UseGuards(BotStudioGuard)
  deleteTopic(@Param('id') id: string) {
    return this.botStudioService.deleteTopic(id);
  }

  @Get('basics')
  @UseGuards(BotStudioGuard)
  getBasics() {
    return this.botStudioService.getBasicsPreview();
  }

  @Get('usage/line')
  @UseGuards(BotStudioGuard)
  getLineUsage() {
    return this.botStudioService.getLineUsage();
  }

  @Get('usage/gemini')
  @UseGuards(BotStudioGuard)
  getGeminiUsage() {
    return this.botStudioService.getGeminiUsage();
  }
}
