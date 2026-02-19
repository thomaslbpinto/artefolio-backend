import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from 'src/core/dtos/create-user.dto';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from 'src/core/dtos/update-user.dto';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';

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

    return plainToInstance(UserResponseDto, await this.userRepository.create(dto), CLASS_TRANSFORMER_OPTIONS);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    return plainToInstance(UserResponseDto, await this.userRepository.findOne(id), CLASS_TRANSFORMER_OPTIONS);
  }

  async findAll(): Promise<UserResponseDto[]> {
    return plainToInstance(UserResponseDto, await this.userRepository.findAll(), CLASS_TRANSFORMER_OPTIONS);
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    return plainToInstance(UserResponseDto, await this.userRepository.update(id, dto), CLASS_TRANSFORMER_OPTIONS);
  }

  async remove(id: number): Promise<UserResponseDto> {
    return plainToInstance(UserResponseDto, await this.userRepository.remove(id), CLASS_TRANSFORMER_OPTIONS);
  }
}
