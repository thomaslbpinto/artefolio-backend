import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { ArtworkResponseDto } from 'src/core/dtos/artwork/artwork-response.dto';
import { CreateArtworkDto } from 'src/core/dtos/artwork/create-artwork.dto';
import { UpdateArtworkDto } from 'src/core/dtos/artwork/update-artwork.dto';
import { IMAGE_MAX_FILE_SIZE_BYTES } from 'src/core/constants/image.constant';
import { ArtworkService } from './artwork.service';
import { UserEntity } from 'src/core/entities/user.entity';

@Controller('artwork')
export class ArtworkController {
  constructor(private readonly artworkService: ArtworkService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, { limits: { fileSize: IMAGE_MAX_FILE_SIZE_BYTES } }))
  async create(
    @Body() dto: CreateArtworkDto,
    @CurrentUser() user: UserEntity,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<ArtworkResponseDto> {
    return await this.artworkService.create(dto, user.id, images);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ArtworkResponseDto> {
    return await this.artworkService.findOne(id);
  }

  @Get()
  async findAll(): Promise<ArtworkResponseDto[]> {
    return await this.artworkService.findAll();
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArtworkDto): Promise<ArtworkResponseDto> {
    return await this.artworkService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ArtworkResponseDto> {
    return await this.artworkService.remove(id);
  }
}
