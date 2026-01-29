import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  bio?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
