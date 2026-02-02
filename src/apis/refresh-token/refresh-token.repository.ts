import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshTokenEntity } from 'src/core/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly repository: Repository<RefreshTokenEntity>,
  ) {}

  async createRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshTokenEntity> {
    const refreshToken = this.repository.create({
      userId,
      token,
      expiresAt,
    });
    return await this.repository.save(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    return await this.repository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.repository.delete({ token });
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.repository.delete({ userId });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
