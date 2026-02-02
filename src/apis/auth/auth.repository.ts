import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/core/entities/user.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findUserByGoogleId(googleId: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { googleId },
    });
  }

  async findUserByEmailWithDeleted(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
  }

  async findUserByUsernameWithDeleted(
    username: string,
  ): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { username },
      withDeleted: true,
    });
  }

  async createUserWithPassword(
    name: string,
    username: string,
    email: string,
    passwordHash: string,
  ): Promise<UserEntity> {
    const user = this.userRepository.create({
      name,
      username,
      email,
      passwordHash,
    });

    return await this.userRepository.save(user);
  }

  async createUserWithGoogleId(
    name: string,
    username: string,
    email: string,
    googleId: string,
    avatarUrl?: string,
  ): Promise<UserEntity> {
    const user = this.userRepository.create({
      name,
      username,
      email,
      googleId,
      avatarUrl,
    });

    return await this.userRepository.save(user);
  }
}
