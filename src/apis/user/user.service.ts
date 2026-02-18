import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/core/dtos/create-user.dto';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from 'src/core/dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    if (!dto.password && !dto.googleId) {
      throw new BadRequestException('Either password or googleId id is required.');
    }

    if (dto.password && dto.googleId) {
      throw new BadRequestException('Only one of password or googleId should be provided.');
    }

    return await this.userRepository.create(dto);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    return await this.userRepository.findOne(id);
  }

  async findAll(): Promise<UserResponseDto[]> {
    return await this.userRepository.findAll();
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    return await this.userRepository.update(id, dto);
  }

  async remove(id: number): Promise<UserResponseDto> {
    return await this.userRepository.remove(id);
  }
}
