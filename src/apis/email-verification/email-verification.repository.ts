import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EmailVerificationTokenEntity } from 'src/core/entities/email-verification-token.entity';

@Injectable()
export class EmailVerificationRepository {
  constructor(
    @InjectRepository(EmailVerificationTokenEntity)
    private readonly repository: Repository<EmailVerificationTokenEntity>,
  ) {}

  async createToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<EmailVerificationTokenEntity> {
    const tokenEntity = this.repository.create({
      userId,
      token,
      expiresAt,
    });

    return await this.repository.save(tokenEntity);
  }

  async findByToken(
    token: string,
  ): Promise<EmailVerificationTokenEntity | null> {
    return await this.repository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async markAsUsed(id: number): Promise<void> {
    await this.repository.update(id, { used: true });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async deleteTokensByUserId(userId: number): Promise<void> {
    await this.repository.delete({ userId });
  }
}
