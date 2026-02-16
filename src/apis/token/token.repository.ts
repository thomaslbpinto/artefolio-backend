import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from 'src/core/entities/token.entity';
import { TokenType } from 'src/core/enums/token-type.enum';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly repository: Repository<TokenEntity>,
  ) {}

  async createToken(userId: number, token: string, type: TokenType, expiresAt: Date): Promise<TokenEntity> {
    const tokenEntity = this.repository.create({
      userId,
      token,
      type,
      expiresAt,
    });

    return await this.repository.save(tokenEntity);
  }

  async findByTokenAndType(token: string, type: TokenType): Promise<TokenEntity | null> {
    return await this.repository.findOne({
      where: { token, type },
      relations: ['user'],
    });
  }

  async deleteByTokenAndType(token: string, type: TokenType): Promise<void> {
    await this.repository.delete({ token, type });
  }

  async deleteByUserIdAndType(userId: number, type: TokenType): Promise<void> {
    await this.repository.delete({ userId, type });
  }
}
