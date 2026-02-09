import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { TokenRepository } from '../token/token.repository';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import { EmailVerificationRepository } from '../email-verification/email-verification.repository';
import { PasswordResetRepository } from '../password-reset/password-reset.repository';
import { UserEntity } from 'src/core/entities/user.entity';
import { TokenEntity } from 'src/core/entities/token.entity';
import { JwtStrategy } from 'src/core/strategies/jwt.strategy';
import { GoogleStrategy } from 'src/core/strategies/google.strategy';
import { EmailModule } from '../email/email.module';

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
    AuthRepository,
    TokenRepository,
    RefreshTokenRepository,
    EmailVerificationRepository,
    PasswordResetRepository,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
