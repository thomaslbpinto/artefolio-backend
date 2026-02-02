import { Expose } from 'class-transformer';
import { UserResponseDto } from '../user.response.dto';

export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  user: UserResponseDto;
}
