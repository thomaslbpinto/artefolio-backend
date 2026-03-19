import { Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 18;

  @Expose()
  @IsOptional()
  @IsNumber()
  total?: number;
}
