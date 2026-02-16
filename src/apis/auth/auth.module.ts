import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenRepository } from '../token/token.repository';
import { RefreshAccessTokenRepository } from '../refresh-access-token/refresh-access-token.repository';
import { EmailVerificationTokenRepository } from '../email-verification-token/email-verification-token.repository';
import { PasswordResetTokenRepository } from '../password-reset-token/password-reset-token.repository';
import { UserEntity } from 'src/core/entities/user.entity';
import { TokenEntity } from 'src/core/entities/token.entity';
import { JwtStrategy } from 'src/core/strategies/jwt.strategy';
import { GoogleStrategy } from 'src/core/strategies/google.strategy';
import { EmailModule } from '../email/email.module';
import { PendingGoogleService } from './services/pending-google.service';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, TokenEntity]),
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
  controllers: [AuthController],
  providers: [
    AuthService,
    PendingGoogleService,
    UserRepository,
    TokenRepository,
    RefreshAccessTokenRepository,
    EmailVerificationTokenRepository,
    PasswordResetTokenRepository,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService, PendingGoogleService],
})
export class AuthModule {}
