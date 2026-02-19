import { NotFoundException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/core/dtos/create-user.dto';
import { UserEntity } from 'src/core/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from 'src/core/dtos/update-user.dto';
import { hashPassword } from 'src/core/utils/password.util';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
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

    return await this.userRepository.save(user);
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
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

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
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

  async remove(id: number): Promise<UserEntity> {
    const user = await this.findOne(id);

    await this.userRepository.softDelete(id);

    return user;
  }
}
