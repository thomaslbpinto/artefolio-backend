import { Injectable } from '@nestjs/common';
import { RefreshTokenEntity } from 'src/core/entities/refresh-token.entity';
import { RefreshTokenRepository } from './refresh-token.repository';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  async create(userId: number, token: string, expiresAt: Date): Promise<RefreshTokenEntity> {
    return this.refreshTokenRepository.create(userId, token, expiresAt);
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    return this.refreshTokenRepository.findByToken(token);
  }

  async deleteByToken(token: string): Promise<void> {
    return this.refreshTokenRepository.deleteByToken(token);
  }

  async deleteByUserId(userId: number): Promise<void> {
    return this.refreshTokenRepository.deleteByUserId(userId);
  }
}
