import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpCodeEntity } from 'src/core/entities/otp-code.entity';
import { RefreshTokenEntity } from 'src/core/entities/refresh-token.entity';
import { UserEntity } from 'src/core/entities/user.entity';
import { GoogleStrategy } from 'src/core/strategies/google.strategy';
import { JwtStrategy } from 'src/core/strategies/jwt.strategy';
import { EmailModule } from '../email/email.module';
import { EmailVerificationOtpCodeService } from '../email-verification-otp-code/email-verifcation-otp-code.service';
import { OtpCodeRepository } from '../otp-code/otp-code.repository';
import { PasswordResetOtpCodeService } from '../password-reset-otp-code/password-reset-otp-code.service';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import { AuthEmailController } from './controllers/auth-email.controller';
import { AuthGoogleController } from './controllers/auth-google.controller';
import { AuthPasswordController } from './controllers/auth-password.controller';
import { AuthSignController } from './controllers/auth-sign.controller';
import { AuthEmailService } from './services/auth-email.service';
import { AuthGoogleService } from './services/auth-google.service';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthSessionService } from './services/auth-session.service';
import { AuthSignService } from './services/auth-sign.service';
import { PendingGoogleService } from './services/pending-google.service';
import { AuthSessionController } from './controllers/auth-session.controller';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity, OtpCodeEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    EmailModule,
  ],
  controllers: [
    AuthEmailController,
    AuthGoogleController,
    AuthPasswordController,
    AuthSessionController,
    AuthSignController,
  ],
  providers: [
    AuthEmailService,
    AuthGoogleService,
    AuthPasswordService,
    AuthSessionService,
    AuthSignService,
    PendingGoogleService,
    OtpCodeRepository,
    RefreshTokenRepository,
    EmailVerificationOtpCodeService,
    PasswordResetOtpCodeService,
    UserRepository,
    GoogleStrategy,
    JwtStrategy,
  ],
  exports: [PendingGoogleService],
})
export class AuthModule {}
