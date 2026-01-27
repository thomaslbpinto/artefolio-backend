import { ArtworkGenreEnum } from 'src/enums/artwork-genre.enum';
import { ArtworkTechniqueEnum } from 'src/enums/artwork-technique.enum';
import { ArtworkTypeEnum } from 'src/enums/artwork-type.enum';
import { ArtworkVisibilityEnum } from 'src/enums/artwork-visibility.enum';
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
import { UserEntity } from './user.entity';
import { CollectionEntity } from './collection.entity';
import { ImageEntity } from './image.entity';

@Entity('artwork')
export class ArtworkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ArtworkTypeEnum })
  type: ArtworkTypeEnum;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  year?: number;

  @Column({ nullable: true })
  country?: string;

  @Column({ type: 'enum', enum: ArtworkTechniqueEnum, nullable: true })
  technique?: ArtworkTechniqueEnum;

  @Column({ type: 'enum', enum: ArtworkGenreEnum, nullable: true })
  genre?: ArtworkGenreEnum;

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
    enum: ArtworkVisibilityEnum,
    default: ArtworkVisibilityEnum.PUBLIC,
  })
  visibility: ArtworkVisibilityEnum;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
