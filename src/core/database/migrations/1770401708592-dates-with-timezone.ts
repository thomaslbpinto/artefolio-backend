import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatesWithTimezone1770401708592 implements MigrationInterface {
  name = 'DatesWithTimezone1770401708592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "collection" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "image" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "image" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "image" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "technique"`);
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "technique" "public"."artwork_technique_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "genre"`);
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "genre" "public"."artwork_genre_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "expires_at" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "artwork" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "genre"`);
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "genre" artwork_genre_enum`,
    );
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "technique"`);
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "technique" artwork_technique_enum`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "image" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "image" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "image" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
