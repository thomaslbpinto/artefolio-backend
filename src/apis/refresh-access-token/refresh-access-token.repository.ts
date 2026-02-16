import { Injectable } from '@nestjs/common';
import { TokenRepository } from '../token/token.repository';
import { TokenEntity } from 'src/core/entities/token.entity';
import { TokenType } from 'src/core/enums/token-type.enum';

@Injectable()
export class RefreshAccessTokenRepository {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async createToken(userId: number, token: string, expiresAt: Date): Promise<TokenEntity> {
    return await this.tokenRepository.createToken(userId, token, TokenType.REFRESH_ACCESS, expiresAt);
  }

  async findByToken(token: string): Promise<TokenEntity | null> {
    return await this.tokenRepository.findByTokenAndType(token, TokenType.REFRESH_ACCESS);
  }

  async deleteByToken(token: string): Promise<void> {
    await this.tokenRepository.deleteByTokenAndType(token, TokenType.REFRESH_ACCESS);
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.tokenRepository.deleteByUserIdAndType(userId, TokenType.REFRESH_ACCESS);
  }
}
