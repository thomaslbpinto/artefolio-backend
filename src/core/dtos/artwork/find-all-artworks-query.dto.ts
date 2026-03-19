import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto } from '../pagination.dto';
import { FindAllArtworksFiltersDto } from './find-all-artworks-filter.dto';

export class FindAllArtworksQueryDto extends IntersectionType(PaginationDto, FindAllArtworksFiltersDto) {}
