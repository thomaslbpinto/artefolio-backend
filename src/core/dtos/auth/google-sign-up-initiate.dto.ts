import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleSignUpInitiateDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
