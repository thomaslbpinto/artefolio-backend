import { Injectable } from '@nestjs/common';
import { TokenRepository } from '../token/token.repository';
import { TokenEntity } from 'src/core/entities/token.entity';
import { TokenType } from 'src/core/enums/token-type.enum';

@Injectable()
export class PasswordResetTokenRepository {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async createToken(userId: number, token: string, expiresAt: Date): Promise<TokenEntity> {
    return await this.tokenRepository.createToken(userId, token, TokenType.PASSWORD_FORGOT, expiresAt);
  }

  async findByToken(token: string): Promise<TokenEntity | null> {
    return await this.tokenRepository.findByTokenAndType(token, TokenType.PASSWORD_FORGOT);
  }

  async deleteByToken(token: string): Promise<void> {
    await this.tokenRepository.deleteByTokenAndType(token, TokenType.PASSWORD_FORGOT);
  }

  async deleteTokensByUserId(userId: number): Promise<void> {
    await this.tokenRepository.deleteByUserIdAndType(userId, TokenType.PASSWORD_FORGOT);
  }
}
