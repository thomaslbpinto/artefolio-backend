import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkEntity } from './core/entities/artwork.entity';
import { CollectionEntity } from './core/entities/collection.entity';
import { ImageEntity } from './core/entities/image.entity';
import { UserEntity } from './core/entities/user.entity';
import { UserModule } from './apis/user/user.module';

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
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
