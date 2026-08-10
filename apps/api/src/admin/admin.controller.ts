import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { SettingsService, UploadedImageFile } from '@/settings/settings.service';
import { GetGuestsQueryDto } from './dto/get-guests-query.dto';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { GuestListResponseDto, GuestResponseDto } from './dto/guest-response.dto';
import { WishResponseDto } from './dto/wish-response.dto';
import { StatsResponseDto } from './dto/stats-response.dto';
import {
  UpdateWeddingSettingsDto,
  WeddingSettingsResponseDto,
} from '@/settings/dto/wedding-settings.dto';
import { GetWishesQueryDto } from './dto/get-wishes-query.dto';
import {
  CreateGuestCategoryDto,
  GuestCategoryResponseDto,
  UpdateGuestCategoryDto,
} from './dto/guest-category.dto';
import {
  GetLineFriendsQueryDto,
  LineFriendResponseDto,
  LinkLineFriendDto,
} from './dto/line-friend.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get('line-friends')
  @ApiOperation({ summary: 'รายชื่อคนที่เพิ่ม LINE OA (Admin)' })
  @ApiResponse({ status: 200, type: [LineFriendResponseDto] })
  async getLineFriends(
    @Query() query: GetLineFriendsQueryDto,
  ): Promise<LineFriendResponseDto[]> {
    return this.adminService.getLineFriends(query);
  }

  @Post('line-friends/:id/link')
  @ApiOperation({ summary: 'ผูก LINE กับ Guest (Admin)' })
  @ApiResponse({ status: 200, type: LineFriendResponseDto })
  async linkLineFriend(
    @Param('id') id: string,
    @Body() dto: LinkLineFriendDto,
  ): Promise<LineFriendResponseDto> {
    return this.adminService.linkLineFriend(id, dto);
  }

  @Delete('line-friends/:id/link')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ยกเลิกการผูก LINE กับ Guest (Admin)' })
  @ApiResponse({ status: 204 })
  async unlinkLineFriend(@Param('id') id: string): Promise<void> {
    return this.adminService.unlinkLineFriend(id);
  }

  @Delete('line-friends/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบรายชื่อ LINE ออกจากระบบ (Admin)' })
  @ApiResponse({ status: 204 })
  async deleteLineFriend(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteLineFriend(id);
  }

  @Get('guest-categories')
  @ApiOperation({ summary: 'รายการประเภทแขก (Admin)' })
  @ApiResponse({ status: 200, type: [GuestCategoryResponseDto] })
  async getGuestCategories(): Promise<GuestCategoryResponseDto[]> {
    return this.adminService.getGuestCategories();
  }

  @Post('guest-categories')
  @ApiOperation({ summary: 'เพิ่มประเภทแขก (Admin)' })
  @ApiResponse({ status: 201, type: GuestCategoryResponseDto })
  async createGuestCategory(
    @Body() dto: CreateGuestCategoryDto,
  ): Promise<GuestCategoryResponseDto> {
    return this.adminService.createGuestCategory(dto);
  }

  @Patch('guest-categories/:id')
  @ApiOperation({ summary: 'แก้ไขประเภทแขก (Admin)' })
  @ApiResponse({ status: 200, type: GuestCategoryResponseDto })
  async updateGuestCategory(
    @Param('id') id: string,
    @Body() dto: UpdateGuestCategoryDto,
  ): Promise<GuestCategoryResponseDto> {
    return this.adminService.updateGuestCategory(id, dto);
  }

  @Delete('guest-categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบประเภทแขก (Admin)' })
  @ApiResponse({ status: 204 })
  async deleteGuestCategory(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteGuestCategory(id);
  }

  @Get('guests')
  @ApiOperation({ summary: 'รายชื่อแขกทั้งหมด (Admin)' })
  @ApiResponse({ status: 200, type: GuestListResponseDto })
  async getGuests(
    @Query() query: GetGuestsQueryDto,
  ): Promise<GuestListResponseDto> {
    return this.adminService.getGuests(query);
  }

  @Post('guests')
  @ApiOperation({ summary: 'สร้างแขก + ลิงก์เชิญ (Admin)' })
  @ApiResponse({ status: 201, type: GuestResponseDto })
  async createGuest(@Body() dto: CreateGuestDto): Promise<GuestResponseDto> {
    return this.adminService.createGuest(dto);
  }

  @Patch('guests/:id')
  @ApiOperation({ summary: 'แก้ไขชื่อบนการ์ด (Admin)' })
  @ApiResponse({ status: 200, type: GuestResponseDto })
  async updateGuest(
    @Param('id') id: string,
    @Body() dto: UpdateGuestDto,
  ): Promise<GuestResponseDto> {
    return this.adminService.updateGuest(id, dto);
  }

  @Delete('guests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบแขกที่ยังไม่ตอบรับ (Admin)' })
  @ApiResponse({ status: 204 })
  async deleteGuest(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteGuest(id);
  }

  @Get('guests/stats')
  @ApiOperation({ summary: 'สรุปสถิติ attending/declined/wishes (Admin)' })
  @ApiResponse({ status: 200, type: StatsResponseDto })
  async getStats(): Promise<StatsResponseDto> {
    return this.adminService.getStats();
  }

  @Get('wishes')
  @ApiOperation({ summary: 'การ์ดอวยพร เรียงล่าสุดก่อน (Admin)' })
  @ApiResponse({ status: 200, type: [WishResponseDto] })
  async getWishes(@Query() query: GetWishesQueryDto): Promise<WishResponseDto[]> {
    return this.adminService.getWishes(query);
  }

  @Get('settings')
  @ApiOperation({ summary: 'ข้อมูลงานแต่ง (Admin)' })
  @ApiResponse({ status: 200, type: WeddingSettingsResponseDto })
  async getSettings(): Promise<WeddingSettingsResponseDto> {
    return this.settingsService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'แก้ไขข้อมูลงาน (Admin)' })
  @ApiResponse({ status: 200, type: WeddingSettingsResponseDto })
  async updateSettings(
    @Body() dto: UpdateWeddingSettingsDto,
  ): Promise<WeddingSettingsResponseDto> {
    return this.settingsService.updateSettings(dto);
  }

  @Post('settings/payment-qr')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'อัปโหลด QR Code ชำระเงิน (Admin)' })
  @ApiResponse({ status: 200, type: WeddingSettingsResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
          cb(new BadRequestException('รองรับเฉพาะไฟล์รูป JPG, PNG หรือ WEBP') as Error, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadPaymentQr(
    @UploadedFile() file: UploadedImageFile,
  ): Promise<WeddingSettingsResponseDto> {
    return this.settingsService.uploadPaymentQr(file);
  }
}
