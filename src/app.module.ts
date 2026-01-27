import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkEntity } from './entities/artwork.entity';
import { CollectionEntity } from './entities/collection.entity';
import { ImageEntity } from './entities/image.entity';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_DATABASE'),
        schema: config.get<string>('DB_SCHEMA'),
        autoLoadEntities: true,
        entities: [ArtworkEntity, CollectionEntity, ImageEntity, UserEntity],
        synchronize: true, // TODO: Change to migrations later
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
