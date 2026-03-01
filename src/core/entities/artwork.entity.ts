import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArtworkGenreEnum } from '../enums/artwork/artwork-genre.enum';
import { ArtworkTechniqueEnum } from '../enums/artwork/artwork-technique.enum';
import { ArtworkTypeEnum } from '../enums/artwork/artwork-type.enum';
import { VisibilityEnum } from '../enums/visibility.enum';
import { CollectionEntity } from './collection.entity';
import { ImageEntity } from './image.entity';
import { UserEntity } from './user.entity';

@Entity('artwork')
export class ArtworkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ArtworkTypeEnum })
  type: ArtworkTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  year?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country?: string;

  @Column({ type: 'enum', enum: ArtworkTechniqueEnum, array: true, nullable: true })
  technique?: ArtworkTechniqueEnum[];

  @Column({ type: 'enum', enum: ArtworkGenreEnum, array: true, nullable: true })
  genre?: ArtworkGenreEnum[];

  @Column({
    name: 'physical_height',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  physicalHeight?: number;

  @Column({
    name: 'physical_width',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  physicalWidth?: number;

  @Column({
    name: 'physical_depth',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  physicalDepth?: number;

  @Column({ name: 'digital_height', type: 'int', nullable: true })
  digitalHeight?: number;

  @Column({ name: 'digital_width', type: 'int', nullable: true })
  digitalWidth?: number;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number;

  @Column({ type: 'text', nullable: true })
  materials?: string;

  @Column({ type: 'text', nullable: true })
  tools?: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  @Column({
    type: 'enum',
    enum: VisibilityEnum,
    default: VisibilityEnum.PUBLIC,
  })
  visibility: VisibilityEnum;

  @OneToMany(() => ImageEntity, (image) => image.artwork)
  images: ImageEntity[];

  @ManyToOne(() => CollectionEntity, (collection) => collection.artworks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'collection_id' })
  collection?: CollectionEntity;

  @ManyToOne(() => UserEntity, (user) => user.artworks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

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
