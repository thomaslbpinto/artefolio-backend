import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

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
  @Matches(/^(?!\.)(?!.*\.\.)([a-zA-Z0-9._]+)(?<!\.)$/, {
    message:
      'username can contain letters, numbers, underscores and dots, but cannot start or end with a dot or contain consecutive dots',
  })
  username: string;
}
