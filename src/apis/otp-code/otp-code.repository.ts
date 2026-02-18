import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpCodeEntity } from 'src/core/entities/otp-code.entity';
import { OtpPurpose } from 'src/core/enums/otp-purpose.enum';

@Injectable()
export class OtpCodeRepository {
  constructor(
    @InjectRepository(OtpCodeEntity)
    private readonly repository: Repository<OtpCodeEntity>,
  ) {}

  async create(userId: number, codeHash: string, expiresAt: Date, purpose: OtpPurpose): Promise<OtpCodeEntity> {
    const otpCode = this.repository.create({
      userId,
      codeHash,
      expiresAt,
      purpose,
    });

    return await this.repository.save(otpCode);
  }

  async findByUserIdAndPurpose(userId: number, purpose: OtpPurpose): Promise<OtpCodeEntity | null> {
    return await this.repository.findOne({
      where: { userId, purpose },
    });
  }

  async deleteByUserIdAndPurpose(userId: number, purpose: OtpPurpose): Promise<void> {
    await this.repository.delete({ userId, purpose });
  }
}
