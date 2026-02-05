import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

config();

const caPath = process.env.DB_SSL_CA_PATH;
const sslConfig = caPath
  ? {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.resolve(caPath)).toString(),
    }
  : {
      rejectUnauthorized: false,
    };

export default new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  ssl: sslConfig,
  synchronize: false,
  entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
});
