import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { USERNAME_REGEX, USERNAME_REGEX_MESSAGE } from 'src/core/utils/username.util';

export class GoogleSignUpCompleteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(USERNAME_REGEX, { message: USERNAME_REGEX_MESSAGE })
  username: string;
}
