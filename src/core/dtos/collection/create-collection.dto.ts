import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { VisibilityEnum } from '../../enums/visibility.enum';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsEnum(VisibilityEnum)
  @IsNotEmpty()
  visibility: VisibilityEnum;
}
