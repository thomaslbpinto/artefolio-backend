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
import { VisibilityEnum } from '../enums/visibility.enum';
import { ArtworkEntity } from './artwork.entity';
import { UserEntity } from './user.entity';

@Entity('collection')
export class CollectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: VisibilityEnum,
    default: VisibilityEnum.PUBLIC,
  })
  visibility: VisibilityEnum;

  @ManyToOne(() => UserEntity, (user) => user.collections, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => ArtworkEntity, (artwork) => artwork.collection)
  artworks: ArtworkEntity[];

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
