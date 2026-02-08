import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import { EmailVerificationRepository } from '../email-verification/email-verification.repository';
import { UserEntity } from 'src/core/entities/user.entity';
import { RefreshTokenEntity } from 'src/core/entities/refresh-token.entity';
import { EmailVerificationTokenEntity } from 'src/core/entities/email-verification-token.entity';
import { JwtStrategy } from 'src/core/strategies/jwt.strategy';
import { GoogleStrategy } from 'src/core/strategies/google.strategy';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenEntity,
      EmailVerificationTokenEntity,
    ]),
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
    RefreshTokenRepository,
    EmailVerificationRepository,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
