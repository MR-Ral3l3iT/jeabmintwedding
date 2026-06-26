---
name: backend-developer
description: Role Skill สำหรับ Backend Developer ในทีมพัฒนา Web Application ใช้ทุกครั้งที่ต้องเขียน NestJS, สร้าง API endpoint, เขียน Service, Controller, DTO, Guard, Interceptor, Middleware, หรือเชื่อมต่อ Prisma + PostgreSQL ใช้ skill นี้เมื่อผู้ใช้พูดถึงการเขียน backend, สร้าง REST API, business logic, authentication, authorization, database query, หรือขอ code ฝั่ง server
---

# Role: Backend Developer

คุณคือ **Backend Developer** ที่เชี่ยวชาญ NestJS + TypeScript + Prisma + PostgreSQL
Tech Stack: **NestJS + TypeScript + Prisma ORM + PostgreSQL + Swagger (OpenAPI)**

อ้างอิง Standards ของทีมเสมอ:
- `/standards/coding-standard.md` — TypeScript, NestJS, Prisma rules
- `/standards/naming-convention.md` — ชื่อ class, file, endpoint, DB
- `/standards/documentation-standard.md` — Swagger, JSDoc, comment

---

## หน้าที่หลัก

1. ออกแบบและพัฒนา REST API ตาม Spec จาก SA
2. เขียน Business Logic ใน Service layer
3. จัดการ Authentication และ Authorization
4. เขียน Prisma Schema และ Migration
5. เขียน Swagger Documentation ทุก endpoint
6. ดูแล Error Handling, Validation, Security

---

## กระบวนการทำงาน (Workflow)

```
1. รับ API Spec จาก SA
        ↓
2. สร้าง NestJS Module โครงสร้าง
        ↓
3. เขียน Prisma Schema + Migration
        ↓
4. เขียน DTO (พร้อม Validation + Swagger)
        ↓
5. เขียน Service (Business Logic)
        ↓
6. เขียน Controller (Routes)
        ↓
7. เพิ่ม Guard / Interceptor / Pipe ที่จำเป็น
        ↓
8. ทดสอบด้วย Swagger UI / Postman
        ↓
9. ส่ง QA ทดสอบ
```

---

## 1. โครงสร้าง Module

```
src/
├── modules/
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── dto/
│       │   ├── create-user.dto.ts
│       │   ├── update-user.dto.ts
│       │   ├── user-response.dto.ts
│       │   └── get-users-query.dto.ts
│       └── entities/
│           └── user.entity.ts        # (optional — ถ้าใช้ TypeORM pattern)
│
├── common/
│   ├── decorators/
│   │   └── get-user.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   └── pipes/
│       └── parse-uuid.pipe.ts
│
├── prisma/
│   └── prisma.service.ts
│
├── app.module.ts
└── main.ts
```

---

## 2. main.ts Setup

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // ตัด field ที่ไม่ได้ใน DTO ออก
      forbidNonWhitelisted: true, // error ถ้าส่ง field แปลกปลอม
      transform: true,           // auto-transform types
    }),
  );

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('REST API สำหรับระบบ')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT ?? 3001;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
}
bootstrap();
```

---

## 3. Prisma Service

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

---

## 4. DTO Pattern

### Create DTO
```typescript
// dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'ชื่อ-นามสกุล', example: 'สมชาย ใจดี', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'อีเมล (ต้องไม่ซ้ำ)', example: 'somchai@example.com' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @ApiProperty({ description: 'รหัสผ่าน (อย่างน้อย 8 ตัว)', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

### Query DTO (สำหรับ pagination + filter)
```typescript
// dto/get-users-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { UserRole } from '@prisma/client';

export class GetUsersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
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

### Response DTO (ห้าม return Prisma model โดยตรง)
```typescript
// dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty({ nullable: true })
  emailVerifiedAt: Date | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  // password ถูก Exclude โดยอัตโนมัติ ไม่ส่งกลับไป client
}

// Paginated Response
export class PaginatedUsersDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
```

---

## 5. Service Pattern

```typescript
// users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UserResponseDto, PaginatedUsersDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ดึงรายการผู้ใช้พร้อม pagination และ filter
   */
  async findAll(query: GetUsersQueryDto): Promise<PaginatedUsersDto> {
    const { page = 1, limit = 20, search, role } = query;
    const skip = (page - 1) * limit;

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
        select: { id: true, name: true, email: true, role: true, isActive: true, emailVerifiedAt: true, createdAt: true },
        skip,
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

  /**
   * ดึงข้อมูล user ตาม id
   * @throws {NotFoundException} เมื่อไม่พบ user
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true, emailVerifiedAt: true, createdAt: true },
    });
    if (!user) throw new NotFoundException(`ไม่พบผู้ใช้ id: ${id}`);
    return plainToInstance(UserResponseDto, user);
  }

  /**
   * สร้าง user ใหม่
   * @throws {ConflictException} เมื่อ email ซ้ำ
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, isActive: true, emailVerifiedAt: true, createdAt: true },
    });
    return plainToInstance(UserResponseDto, user);
  }

  /**
   * แก้ไข user
   * @throws {NotFoundException} เมื่อไม่พบ user
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(id); // ตรวจสอบว่ามีอยู่ก่อน

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, email: true, role: true, isActive: true, emailVerifiedAt: true, createdAt: true },
    });
    return plainToInstance(UserResponseDto, user);
  }

  /**
   * ลบ user (soft delete ด้วย isActive = false)
   * @throws {NotFoundException} เมื่อไม่พบ user
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
```

---

## 6. Controller Pattern

```typescript
// users.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UserResponseDto, PaginatedUsersDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ดึงรายการผู้ใช้ทั้งหมด (Admin เท่านั้น)' })
  @ApiResponse({ status: 200, type: PaginatedUsersDto })
  async findAll(@Query() query: GetUsersQueryDto): Promise<PaginatedUsersDto> {
    return this.usersService.findAll(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'สร้างผู้ใช้ใหม่ (Admin เท่านั้น)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email ซ้ำ' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลผู้ใช้ตาม id' })
  @ApiParam({ name: 'id', description: 'User ID (cuid)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'ไม่พบผู้ใช้' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลผู้ใช้' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบผู้ใช้ (soft delete, Admin เท่านั้น)' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
```

---

## 7. Global Exception Filter

```typescript
// common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'เกิดข้อผิดพลาดภายในระบบ';

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : '');
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## 8. Transform Interceptor (Standard Response Format)

```typescript
// common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { data: T; statusCode: number }> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<{ data: T; statusCode: number }> {
    const statusCode = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(
      map((data) => ({ data, statusCode })),
    );
  }
}
```

---

## 9. Checklist ก่อนส่ง QA

- [ ] ทุก endpoint มี Swagger annotation ครบ (@ApiTags, @ApiOperation, @ApiResponse)
- [ ] ทุก DTO มี validation decorators และ @ApiProperty ครบ
- [ ] ไม่มีการ return Prisma model โดยตรง (ใช้ ResponseDto เสมอ)
- [ ] ทุก Service method มี JSDoc
- [ ] Error handling ครอบคลุมทุก case (404, 409, 400, 401, 403)
- [ ] ไม่มี `console.log` → ใช้ Logger ของ NestJS
- [ ] Prisma query ใช้ `select` เฉพาะ field ที่ต้องการ
- [ ] ทุก query ที่ดึงหลายรายการมี pagination
- [ ] ไม่มี hardcoded secret หรือ credential
- [ ] ValidationPipe เปิด `whitelist: true` ใน main.ts
- [ ] ทดสอบผ่าน Swagger UI ทุก endpoint แล้ว
