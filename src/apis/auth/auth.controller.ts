import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignInDto } from 'src/core/dtos/auth/sign-in.dto';
import { SignUpDto } from 'src/core/dtos/auth/sign-up.dto';
import { GoogleSignUpCompleteDto } from 'src/core/dtos/auth/google-sign-up-complete.dto';
import { VerifyEmailDto } from 'src/core/dtos/auth/verify-email.dto';
import { ResendVerificationEmailDto } from 'src/core/dtos/auth/resend-verification-email.dto';
import { ForgotPasswordDto } from 'src/core/dtos/auth/forgot-password.dto';
import { ResetPasswordDto } from 'src/core/dtos/auth/reset-password.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { GoogleProfileDto } from 'src/core/dtos/auth/google-profile.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/core/entities/user.entity';
import { GoogleStrategyProfile } from 'src/core/strategies/google.strategy';
import type { Request, Response } from 'express';
import { PendingGoogleService } from './services/pending-google.service';

interface RequestWithGoogleUser extends Request {
  user: GoogleStrategyProfile;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly pendingGoogleService: PendingGoogleService,
  ) {}

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() request: RequestWithGoogleUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.handleGoogleCallback(request.user, response);
  }

  @Public()
  @Get('google/pending-signup')
  getGooglePendingSignupProfile(@Req() request: Request): GoogleProfileDto | null {
    return this.pendingGoogleService.getSignUpCookie(request);
  }

  @Public()
  @Get('google/clear-pending-signup')
  clearGooglePendingSignupProfile(@Res({ passthrough: true }) response: Response): void {
    this.pendingGoogleService.clearSignUpCookie(response);
  }

  @Public()
  @Get('google/pending-link')
  getPendingGoogleLinkCookie(@Req() request: Request): GoogleProfileDto | null {
    return this.pendingGoogleService.getLinkCookie(request);
  }

  @Public()
  @Get('google/clear-pending-link')
  clearGooglePendingLinkProfile(@Res({ passthrough: true }) response: Response): void {
    this.pendingGoogleService.clearLinkCookie(response);
  }

  @Public()
  @Post('google/sign-up/complete')
  async googleSignUpComplete(
    @Body() dto: GoogleSignUpCompleteDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return await this.authService.completeGoogleSignUp(dto, request, response);
  }

  @Public()
  @Post('google/link-account')
  async googleLinkAccount(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return await this.authService.googleLinkAccount(request, response);
  }

  @Public()
  @Post('sign-in')
  async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
    return await this.authService.signIn(dto, response);
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
    return await this.authService.signUp(dto, response);
  }

  @Public()
  @Post('sign-out')
  async signOut(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.authService.signOut(request, response);
  }

  @Post('sign-out-all')
  async signOutAll(@CurrentUser() user: UserEntity, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.authService.signOutAll(user.id, response);
  }

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
    return await this.authService.refreshAccessToken(request, response);
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    await this.authService.verifyEmail(dto.token);
  }

  @Public()
  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() dto: ResendVerificationEmailDto): Promise<void> {
    await this.authService.resendVerificationEmail(dto.email);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.password);
  }
}
