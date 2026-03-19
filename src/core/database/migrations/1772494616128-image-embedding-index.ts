import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImageEmbeddingIndex1772494241859 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX image_embedding_idx ON image USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX image_embedding_idx;
    `);
  }
}
