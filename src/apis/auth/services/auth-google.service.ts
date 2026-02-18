import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { UserRepository } from '../../user/user.repository';
import { GoogleProfileDto } from 'src/core/dtos/auth/google/google-profile.dto';
import { GoogleSignUpCompleteDto } from 'src/core/dtos/auth/google/google-sign-up-complete.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { AuthSessionService } from './auth-session.service';
import { PendingGoogleService } from './pending-google.service';
import { EmailVerificationOtpCodeService } from '../../email-verification-otp-code/email-verifcation-otp-code.service';

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly authSessionService: AuthSessionService,
    private readonly pendingGoogleService: PendingGoogleService,
    private readonly emailVerificationOtpCodeService: EmailVerificationOtpCodeService,
  ) {}

  async handleCallback(profile: GoogleProfileDto, response: Response): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';

    const user = await this.userRepository.findByGoogleId(profile.googleId);

    if (user) {
      await this.authSessionService.createSession(response, user);
      response.redirect(frontendUrl);
      return;
    }

    if (await this.userRepository.findByEmail(profile.email)) {
      const linkToken = this.pendingGoogleService.createLinkToken(profile);
      this.pendingGoogleService.setLinkCookie(response, linkToken);
      response.redirect(`${frontendUrl}/link-google-account`);
      return;
    }

    const signUpToken = this.pendingGoogleService.createSignUpToken(profile);
    this.pendingGoogleService.setSignUpCookie(response, signUpToken);
    response.redirect(`${frontendUrl}/complete-google-sign-up`);
  }

  async completeSignUp(dto: GoogleSignUpCompleteDto, request: Request, response: Response): Promise<AuthResponseDto> {
    const payload = this.pendingGoogleService.getSignUpCookie(request);

    if (!payload) {
      throw new BadRequestException('Invalid or expired pending signup.');
    }

    this.pendingGoogleService.clearSignUpCookie(response);

    if (await this.userRepository.findByEmailWithDeleted(payload.email)) {
      throw new ConflictException('An account with this email already exists.');
    }

    const username = dto.username;

    if (await this.userRepository.findByUsernameWithDeleted(username)) {
      throw new ConflictException('This username is already taken.');
    }

    const user = await this.userRepository.create({
      name: dto.name,
      username: username,
      email: payload.email,
      googleId: payload.googleId,
      avatarUrl: payload.avatarUrl,
    });

    return this.authSessionService.createSession(response, user);
  }

  async linkAccount(request: Request, response: Response): Promise<AuthResponseDto> {
    const payload = this.pendingGoogleService.getLinkCookie(request);

    if (!payload) {
      throw new BadRequestException('Invalid or expired pending link.');
    }

    this.pendingGoogleService.clearLinkCookie(response);

    const user = await this.userRepository.findByEmail(payload.email);

    if (!user || user.googleId) {
      throw new BadRequestException('Account cannot be linked.');
    }

    const userId = user.id;

    const updatedUser = await this.userRepository.update(userId, {
      googleId: payload.googleId,
      avatarUrl: payload.avatarUrl,
    });

    await this.emailVerificationOtpCodeService.deleteByUserId(userId);

    return this.authSessionService.createSession(response, updatedUser);
  }
}
