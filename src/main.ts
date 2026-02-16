import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrls = configService.get<string>('FRONTEND_URLS')?.split(',') ?? [];

  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

  app.use(cookieParser());

  app.setGlobalPrefix(configService.get<string>('APP_GLOBAL_PREFIX') ?? 'api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(configService.get<number>('PORT') ?? 3000);
}

void bootstrap();
