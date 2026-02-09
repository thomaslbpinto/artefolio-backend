import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
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
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from 'src/core/constants/cookie.constants';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/core/entities/user.entity';
import { GoogleStrategyProfile } from 'src/core/strategies/google.strategy';
import type { Request, Response } from 'express';

interface RequestWithGoogleUser extends Request {
  user: GoogleStrategyProfile;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async getPendingSignup(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ profile: GoogleProfileDto | null }> {
    const profile = await this.authService.getPendingSignup(response);

    return { profile: profile ?? null };
  }

  @Public()
  @Get('google/clear-pending-signup')
  clearPendingSignup(@Res({ passthrough: true }) response: Response): {
    ok: true;
  } {
    this.authService.clearPendingSignupCookie(response);
    return { ok: true };
  }

  @Public()
  @Get('google/clear-pending-link')
  clearPendingLink(@Res({ passthrough: true }) response: Response): {
    ok: true;
  } {
    this.authService.clearPendingLinkCookie(response);
    return { ok: true };
  }

  @Public()
  @Get('google/pending-link')
  async getPendingLink(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ profile: GoogleProfileDto | null }> {
    const profile = await this.authService.getPendingLink(response);

    return { profile: profile ?? null };
  }

  @Public()
  @Post('sign-in')
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return await this.authService.signIn(dto, response);
  }

  @Public()
  @Post('sign-up')
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return await this.authService.signUp(dto, response);
  }

  @Public()
  @Post('google/sign-up/complete')
  async googleSignUpComplete(
    @Body() dto: GoogleSignUpCompleteDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return await this.authService.completeGoogleSignUp(dto, response);
  }

  @Public()
  @Post('google/link-account')
  async linkGoogleAccount(
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return await this.authService.linkGoogleAccount(response);
  }

  @Get('me')
  me(@CurrentUser() user: UserEntity): UserResponseDto {
    return plainToInstance(UserResponseDto, user, CLASS_TRANSFORMER_OPTIONS);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = request.cookies?.[COOKIE_REFRESH_TOKEN] as
      | string
      | undefined;

    if (!refreshToken) {
      response.clearCookie(COOKIE_ACCESS_TOKEN, { path: '/' });
      response.clearCookie(COOKIE_REFRESH_TOKEN, { path: '/' });
      throw new UnauthorizedException('No refresh token');
    }

    return await this.authService.refreshAccessToken(refreshToken, response);
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
    await this.authService.verifyEmail(dto.token);
    return { message: 'Email verified successfully' };
  }

  @Public()
  @Post('resend-verification-email')
  async resendVerificationEmail(
    @Body() dto: ResendVerificationEmailDto,
  ): Promise<{ message: string }> {
    await this.authService.resendVerificationEmail(dto.email);
    return { message: 'Verification email sent' };
  }

  @Public()
  @Post('sign-out')
  async signOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const refreshToken = request.cookies?.[COOKIE_REFRESH_TOKEN] as
      | string
      | undefined;

    if (refreshToken) {
      await this.authService.signOut(refreshToken);
    }

    response.clearCookie(COOKIE_ACCESS_TOKEN, { path: '/' });
    response.clearCookie(COOKIE_REFRESH_TOKEN, { path: '/' });

    return { message: 'Signed out successfully' };
  }

  @Post('sign-out-all')
  async signOutAll(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    await this.authService.signOutAll(user.id);

    response.clearCookie(COOKIE_ACCESS_TOKEN, { path: '/' });
    response.clearCookie(COOKIE_REFRESH_TOKEN, { path: '/' });

    return { message: 'Logged out from all devices successfully' };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Password reset successfully' };
  }
}
