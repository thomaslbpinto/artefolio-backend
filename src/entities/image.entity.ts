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
import { ArtworkEntity } from './artwork.entity';
import { ImageProviderEnum } from 'src/enums/image-provider.enum';

@Entity('image')
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column({ type: 'enum', enum: ImageProviderEnum, nullable: false })
  provider: ImageProviderEnum;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @ManyToOne(() => ArtworkEntity, (artwork) => artwork.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artwork_id' })
  artwork: ArtworkEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
