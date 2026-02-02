import { Body, Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from 'src/core/dtos/auth/sign-in.dto';
import { SignUpDto } from 'src/core/dtos/auth/sign-up.dto';
import { GoogleSignInDto } from 'src/core/dtos/auth/google-sign-in.dto';
import { GoogleSignUpInitiateDto } from 'src/core/dtos/auth/google-sign-up-initiate.dto';
import { GoogleSignUpCompleteDto } from 'src/core/dtos/auth/google-sign-up-complete.dto';
import { RefreshTokenDto } from 'src/core/dtos/auth/refresh-token.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { GoogleProfileDto } from 'src/core/dtos/auth/google-profile.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  async signIn(@Body() dto: SignInDto): Promise<AuthResponseDto> {
    return await this.authService.signIn(dto);
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto): Promise<AuthResponseDto> {
    return await this.authService.signUp(dto);
  }

  @Public()
  @Post('google/sign-in')
  async googleSignIn(@Body() dto: GoogleSignInDto): Promise<AuthResponseDto> {
    return await this.authService.googleSignIn(dto);
  }

  @Public()
  @Post('google/sign-up/initiate')
  async googleSignUpInitiate(
    @Body() dto: GoogleSignUpInitiateDto,
  ): Promise<GoogleProfileDto> {
    return await this.authService.googleSignUpInitiate(dto);
  }

  @Public()
  @Post('google/sign-up/complete')
  async googleSignUpComplete(
    @Body() dto: GoogleSignUpCompleteDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.googleSignUpComplete(dto);
  }

  @Get('me')
  me(@CurrentUser() user: UserResponseDto): UserResponseDto {
    return user;
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return await this.authService.refreshAccessToken(dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto): Promise<{ message: string }> {
    await this.authService.logout(dto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  async logoutAll(
    @CurrentUser() user: UserResponseDto,
  ): Promise<{ message: string }> {
    await this.authService.logoutAll(user.id);
    return { message: 'Logged out from all devices successfully' };
  }
}
