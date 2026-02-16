import { NotFoundException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from 'src/core/dtos/create-user.dto';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';
import { UserEntity } from 'src/core/entities/user.entity';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { Repository } from 'typeorm';
import { UpdateUserDto } from 'src/core/dtos/update-user.dto';
import { hashPassword } from 'src/core/utils/password.util';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
      withDeleted: true,
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('An account with this email already exists.');
      }

      throw new ConflictException('This username is already taken.');
    }

    const { password, ...rest } = dto;

    const userData: Partial<UserEntity> = {
      ...rest,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
      ...(dto.googleId ? { emailVerified: true } : {}),
    };

    const user = this.userRepository.create(userData);

    const savedUser = await this.userRepository.save(user);

    return plainToInstance(UserResponseDto, savedUser, CLASS_TRANSFORMER_OPTIONS);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return plainToInstance(UserResponseDto, user, CLASS_TRANSFORMER_OPTIONS);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy({ email });
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy({ googleId });
  }

  async findByEmailWithDeleted(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
  }

  async findByUsernameWithDeleted(username: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { username },
      withDeleted: true,
    });
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });

    return plainToInstance(UserResponseDto, users, CLASS_TRANSFORMER_OPTIONS);
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(id);

    const { password, ...rest } = dto;

    const updateData: Partial<UserEntity> = {
      ...rest,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
      ...(dto.googleId ? { emailVerified: true } : {}),
    };

    await this.userRepository.update(id, updateData);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<UserResponseDto> {
    const user = await this.findOne(id);

    await this.userRepository.softDelete(id);

    return user;
  }
}
