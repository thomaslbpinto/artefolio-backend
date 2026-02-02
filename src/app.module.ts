import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ArtworkEntity } from './core/entities/artwork.entity';
import { CollectionEntity } from './core/entities/collection.entity';
import { ImageEntity } from './core/entities/image.entity';
import { UserEntity } from './core/entities/user.entity';
import { RefreshTokenEntity } from './core/entities/refresh-token.entity';
import { UserModule } from './apis/user/user.module';
import { AuthModule } from './apis/auth/auth.module';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';

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
        entities: [
          ArtworkEntity,
          CollectionEntity,
          ImageEntity,
          UserEntity,
          RefreshTokenEntity,
        ],
        synchronize: true, // TODO: Change to migrations later
      }),
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
