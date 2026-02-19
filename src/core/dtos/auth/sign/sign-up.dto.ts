import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from 'class-validator';
import { USERNAME_REGEX, USERNAME_REGEX_MESSAGE } from 'src/core/utils/username.util';

export class SignUpDto {
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

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
