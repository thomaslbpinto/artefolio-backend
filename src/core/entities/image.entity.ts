import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ImageProviderEnum } from '../enums/image-provider.enum';
import { ArtworkEntity } from './artwork.entity';

@Entity('image')
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'enum', enum: ImageProviderEnum })
  provider: ImageProviderEnum;

  @Column({ name: 'mime_type', type: 'varchar', length: 255 })
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({
    type: 'vector',
    length: 768,
    nullable: true,
  })
  embedding?: number[];

  @ManyToOne(() => ArtworkEntity, (artwork) => artwork.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artwork_id' })
  artwork: ArtworkEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt?: Date;
}
