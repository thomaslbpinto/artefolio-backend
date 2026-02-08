import { Expose, Transform } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';

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
  emailVerified: boolean;

  @Expose()
  @Transform(({ obj }: { obj: UserEntity }) => !!obj.googleId)
  isGoogleLinked: boolean;

  @Expose()
  bio?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
