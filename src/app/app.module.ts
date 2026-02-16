import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ArtworkEntity } from '../core/entities/artwork.entity';
import { CollectionEntity } from '../core/entities/collection.entity';
import { ImageEntity } from '../core/entities/image.entity';
import { UserEntity } from '../core/entities/user.entity';
import { TokenEntity } from '../core/entities/token.entity';
import { UserModule } from '../apis/user/user.module';
import { AuthModule } from '../apis/auth/auth.module';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';
import fs from 'fs';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const caPath = config.get<string>('DB_SSL_CA_PATH');
        const sslConfig = !caPath
          ? false
          : {
              rejectUnauthorized: true,
              ca: fs.readFileSync(path.resolve(caPath)).toString(),
            };

        return {
          type: 'postgres',
          url: config.get<string>('DB_URL'),
          ssl: sslConfig,
          synchronize: false,
          entities: [ArtworkEntity, CollectionEntity, ImageEntity, UserEntity, TokenEntity],
          autoLoadEntities: true,
        };
      },
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
