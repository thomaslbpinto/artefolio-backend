import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { PendingGoogleService } from '../services/pending-google.service';
import { GoogleSignUpCompleteDto } from 'src/core/dtos/auth/google/google-sign-up-complete.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { GoogleProfileDto } from 'src/core/dtos/auth/google/google-profile.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { GoogleStrategyProfile } from 'src/core/strategies/google.strategy';
import { AuthGoogleService } from '../services/auth-google.service';

interface RequestWithGoogleUser extends Request {
  user: GoogleStrategyProfile;
}

@Controller('auth/google')
export class AuthGoogleController {
  constructor(
    private readonly authGoogleService: AuthGoogleService,
    private readonly pendingGoogleService: PendingGoogleService,
  ) {}

  @Public()
  @Get()
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {}

  @Public()
  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() request: RequestWithGoogleUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authGoogleService.handleCallback(request.user, response);
  }

  @Public()
  @Get('pending-signup')
  getGooglePendingSignupProfile(@Req() request: Request): GoogleProfileDto | null {
    return this.pendingGoogleService.getSignUpCookie(request);
  }

  @Public()
  @Get('clear-pending-signup')
  clearGooglePendingSignupProfile(@Res({ passthrough: true }) response: Response): void {
    this.pendingGoogleService.clearSignUpCookie(response);
  }

  @Public()
  @Get('pending-link')
  getPendingGoogleLinkCookie(@Req() request: Request): GoogleProfileDto | null {
    return this.pendingGoogleService.getLinkCookie(request);
  }

  @Public()
  @Get('clear-pending-link')
  clearGooglePendingLinkProfile(@Res({ passthrough: true }) response: Response): void {
    this.pendingGoogleService.clearLinkCookie(response);
  }

  @Public()
  @Post('sign-up/complete')
  async googleSignUpComplete(
    @Body() dto: GoogleSignUpCompleteDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return await this.authGoogleService.completeSignUp(dto, request, response);
  }

  @Public()
  @Post('link-account')
  async googleLinkAccount(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return await this.authGoogleService.linkAccount(request, response);
  }
}
