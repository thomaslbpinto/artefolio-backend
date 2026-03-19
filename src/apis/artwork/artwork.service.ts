import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateArtworkDto } from 'src/core/dtos/artwork/create-artwork.dto';
import { ArtworkResponseDto } from 'src/core/dtos/artwork/artwork-response.dto';
import { ArtworkRepository } from './artwork.repository';
import { UpdateArtworkDto } from 'src/core/dtos/artwork/update-artwork.dto';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { ArtworkPaginatedResponseDto } from 'src/core/dtos/artwork/artwork-paginated-response.dto';
import { FindAllArtworksFiltersDto } from 'src/core/dtos/artwork/find-all-artworks-filter.dto';

@Injectable()
export class ArtworkService {
  constructor(private readonly artworkRepository: ArtworkRepository) {}

  async create(dto: CreateArtworkDto, userId: number, images: Express.Multer.File[]): Promise<ArtworkResponseDto> {
    return plainToInstance(
      ArtworkResponseDto,
      await this.artworkRepository.create(dto, userId, images),
      CLASS_TRANSFORMER_OPTIONS,
    );
  }

  async findOne(id: number): Promise<ArtworkResponseDto> {
    return plainToInstance(ArtworkResponseDto, await this.artworkRepository.findOne(id), CLASS_TRANSFORMER_OPTIONS);
  }

  async findAll(): Promise<ArtworkResponseDto[]> {
    return plainToInstance(ArtworkResponseDto, await this.artworkRepository.findAll(), CLASS_TRANSFORMER_OPTIONS);
  }

  async findAllPublicPaginated(
    page: number,
    limit: number,
    filters: FindAllArtworksFiltersDto,
  ): Promise<ArtworkPaginatedResponseDto> {
    const [artworks, total] = await this.artworkRepository.findAllPublicPaginated(page, limit, filters);

    return plainToInstance(
      ArtworkPaginatedResponseDto,
      {
        artworks: plainToInstance(ArtworkResponseDto, artworks, CLASS_TRANSFORMER_OPTIONS),
        pagination: {
          page,
          limit,
          total,
        },
      },
      CLASS_TRANSFORMER_OPTIONS,
    );
  }

  async update(id: number, dto: UpdateArtworkDto): Promise<ArtworkResponseDto> {
    return plainToInstance(ArtworkResponseDto, await this.artworkRepository.update(id, dto), CLASS_TRANSFORMER_OPTIONS);
  }

  async remove(id: number): Promise<ArtworkResponseDto> {
    return plainToInstance(ArtworkResponseDto, await this.artworkRepository.remove(id), CLASS_TRANSFORMER_OPTIONS);
  }
}
