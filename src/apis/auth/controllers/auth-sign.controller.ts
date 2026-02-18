import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { SignInDto } from 'src/core/dtos/auth/sign/sign-in.dto';
import { SignUpDto } from 'src/core/dtos/auth/sign/sign-up.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserEntity } from 'src/core/entities/user.entity';
import { AuthSignService } from '../services/auth-sign.service';

@Controller('auth')
export class AuthSignController {
  constructor(private readonly authSignService: AuthSignService) {}

  @Public()
  @Post('sign-in')
  async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
    return await this.authSignService.signIn(dto, response);
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
    return await this.authSignService.signUp(dto, response);
  }

  @Public()
  @Post('sign-out')
  async signOut(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.authSignService.signOut(request, response);
  }

  @Post('sign-out-all')
  async signOutAll(@CurrentUser() user: UserEntity, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.authSignService.signOutAll(user.id, response);
  }
}
