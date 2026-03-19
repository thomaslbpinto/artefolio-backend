import { MigrationInterface, QueryRunner } from 'typeorm';

export class Configuration1772323529924 implements MigrationInterface {
  name = 'Configuration1772323529924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS vector`);
  }
}
