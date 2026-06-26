---
name: backend-coding
description: Task Skill สำหรับการเขียนโค้ด Backend ใช้ทุกครั้งที่ต้องสร้าง NestJS Module, เขียน Controller, Service, DTO, Guard, หรือ Prisma Query สำหรับ REST API ใช้ skill นี้เมื่อผู้ใช้ขอ code backend, สร้าง API endpoint, เขียน business logic, จัดการ authentication, เขียน database query, หรือขอ code ฝั่ง server ด้วย NestJS
---

# Task: Backend Coding

งานนี้ใช้ร่วมกับ Role: **Backend Developer**
อ้างอิง: `/standards/coding-standard.md`, `/standards/naming-convention.md`

---

## ขั้นตอนการทำงาน

```
Step 1: รับ API Contract จาก SA/Designer
        ↓
Step 2: สร้าง NestJS Module Structure
        ↓
Step 3: เขียน DTO (Request + Response)
        ↓
Step 4: เขียน Service (Business Logic)
        ↓
Step 5: เขียน Controller (Routes)
        ↓
Step 6: Register Module ใน AppModule
        ↓
Step 7: ทดสอบผ่าน Swagger UI
```

---

## Step 1: สร้าง Module Structure

```bash
# สร้างด้วย NestJS CLI
nest generate module modules/users
nest generate controller modules/users
nest generate service modules/users

# หรือสร้างไฟล์เองตาม structure:
src/modules/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── user-response.dto.ts
│   └── get-users-query.dto.ts
```

---

## Step 2: DTO Templates

### Create DTO
```typescript
// dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsEnum, IsNotEmpty, IsOptional,
  IsString, MaxLength, MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'ชื่อ-นามสกุล', example: 'สมชาย ใจดี' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'อีเมล', example: 'somchai@example.com' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @ApiProperty({ description: 'รหัสผ่าน (อย่างน้อย 8 ตัว)' })
  @IsString()
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

### Update DTO
```typescript
// dto/update-user.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// PartialType ทำให้ทุก field เป็น optional อัตโนมัติ
// OmitType ตัด email และ password ออก (ไม่ให้แก้ผ่าน endpoint นี้)
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password'] as const)
) {}
```

### Query DTO
```typescript
// dto/get-users-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { UserRole } from '@prisma/client';

export class GetUsersQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'ค้นหาจาก name หรือ email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

### Response DTO
```typescript
// dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() email: string;
  @Expose() @ApiProperty({ enum: UserRole }) role: UserRole;
  @Expose() @ApiProperty() isActive: boolean;
  @Expose() @ApiProperty({ nullable: true }) emailVerifiedAt: Date | null;
  @Expose() @ApiProperty() createdAt: Date;
  // password ถูก Exclude อัตโนมัติ
}

export class PaginatedUsersDto {
  @ApiProperty({ type: [UserResponseDto] }) data: UserResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}
```

---

## Step 3: Service Template

```typescript
// users.service.ts
import {
  BadRequestException, ConflictException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsersDto, UserResponseDto } from './dto/user-response.dto';

// Select ที่ใช้บ่อย — กำหนดเป็น const ไม่ต้องเขียนซ้ำ
const USER_SELECT = {
  id: true, name: true, email: true,
  role: true, isActive: true,
  emailVerifiedAt: true, createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetUsersQueryDto): Promise<PaginatedUsersDto> {
    const { page = 1, limit = 20, search, role } = query;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: plainToInstance(UserResponseDto, users),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException(`ไม่พบผู้ใช้ id: ${id}`);
    return plainToInstance(UserResponseDto, user);
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { ...dto, email: dto.email.toLowerCase(), password: hashed },
      select: USER_SELECT,
    });
    return plainToInstance(UserResponseDto, user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(id); // ตรวจสอบก่อนเสมอ

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });
    return plainToInstance(UserResponseDto, user);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
```

---

## Step 4: Controller Template

```typescript
// users.controller.ts
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiParam,
  ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsersDto, UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ดึงรายการผู้ใช้ทั้งหมด' })
  @ApiResponse({ status: 200, type: PaginatedUsersDto })
  findAll(@Query() query: GetUsersQueryDto): Promise<PaginatedUsersDto> {
    return this.usersService.findAll(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'สร้างผู้ใช้ใหม่' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email ซ้ำ' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลผู้ใช้ตาม ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'ไม่พบผู้ใช้' })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลผู้ใช้' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบผู้ใช้ (soft delete)' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
```

---

## Step 5: Module Registration

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // export ถ้า module อื่นต้องใช้
})
export class UsersModule {}
```

```typescript
// app.module.ts — register ทุก module ที่นี่
import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
```

---

## Checklist ก่อนส่ง QA

- [ ] ทุก endpoint มี Swagger decorators ครบ
- [ ] ทุก DTO มี `@ApiProperty` และ validation ครบ
- [ ] ไม่มีการ return Prisma model โดยตรง — ใช้ `plainToInstance` เสมอ
- [ ] ทุก Service method มี JSDoc
- [ ] `email.toLowerCase()` ก่อน query/create เสมอ
- [ ] Error cases ครบ: 400, 401, 403, 404, 409
- [ ] Prisma query ใช้ `select` เฉพาะ field ที่ต้องการ
- [ ] List endpoint มี pagination เสมอ
- [ ] ไม่มี `console.log` → ใช้ `Logger` ของ NestJS
- [ ] `whitelist: true` ใน ValidationPipe (ตั้งใน main.ts)
- [ ] ทดสอบทุก endpoint ผ่าน Swagger UI แล้ว
