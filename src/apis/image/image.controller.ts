import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ImageResponseDto } from 'src/core/dtos/image/image-response.dto';
import { ImageService } from './image.service';
import { CreateImageDto } from 'src/core/dtos/image/create-image.dto';
import { UpdateImageDto } from 'src/core/dtos/image/update-image.dto';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  async create(@Body() dto: CreateImageDto): Promise<ImageResponseDto> {
    return await this.imageService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ImageResponseDto> {
    return await this.imageService.findOne(id);
  }

  @Get()
  async findAll(): Promise<ImageResponseDto[]> {
    return await this.imageService.findAll();
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateImageDto): Promise<ImageResponseDto> {
    return await this.imageService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ImageResponseDto> {
    return await this.imageService.remove(id);
  }
}
