import { Expose } from 'class-transformer';

export class GoogleProfileDto {
  @Expose()
  email: string;

  @Expose()
  name?: string;

  @Expose()
  googleId: string;

  @Expose()
  avatarUrl?: string;
}
