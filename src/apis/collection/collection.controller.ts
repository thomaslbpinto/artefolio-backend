import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CollectionResponseDto } from 'src/core/dtos/collection/collection-response.dto';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from 'src/core/dtos/collection/create-collection.dto';
import { UpdateCollectionDto } from 'src/core/dtos/collection/update-collection.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  async create(@Body() dto: CreateCollectionDto): Promise<CollectionResponseDto> {
    return await this.collectionService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CollectionResponseDto> {
    return await this.collectionService.findOne(id);
  }

  @Get()
  async findAll(): Promise<CollectionResponseDto[]> {
    return await this.collectionService.findAll();
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> {
    return await this.collectionService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<CollectionResponseDto> {
    return await this.collectionService.remove(id);
  }
}
