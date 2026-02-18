import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { UserEntity } from 'src/core/entities/user.entity';
import { AuthSessionService } from '../services/auth-session.service';

@Controller('auth')
export class AuthSessionController {
  constructor(private readonly authSessionService: AuthSessionService) {}

  @Get('me')
  me(@CurrentUser() user: UserEntity): UserResponseDto {
    return plainToInstance(UserResponseDto, user, CLASS_TRANSFORMER_OPTIONS);
  }

  @Public()
  @Post('refresh-access-token')
  async refreshAccessToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return await this.authSessionService.refreshAccessToken(request, response);
  }
}
