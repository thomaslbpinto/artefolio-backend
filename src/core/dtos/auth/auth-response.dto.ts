import { Expose } from 'class-transformer';
import { UserResponseDto } from '../user/user-response.dto';

export class AuthResponseDto {
  @Expose()
  user: UserResponseDto;
}
