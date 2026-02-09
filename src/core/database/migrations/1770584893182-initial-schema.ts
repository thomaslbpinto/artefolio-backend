import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1770584893182 implements MigrationInterface {
  name = 'InitialSchema1770584893182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "collection" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_ad3f485bbc99d875491f44d7c85" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."image_provider_enum" AS ENUM('S3', 'CLOUDFLARE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "image" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "provider" "public"."image_provider_enum" NOT NULL, "mime_type" character varying NOT NULL, "size" bigint NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "artwork_id" integer, CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."artwork_type_enum" AS ENUM('DIGITAL', 'PHYSICAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."artwork_technique_enum" AS ENUM()`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."artwork_genre_enum" AS ENUM()`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."artwork_visibility_enum" AS ENUM('PUBLIC', 'PRIVATE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "artwork" ("id" SERIAL NOT NULL, "type" "public"."artwork_type_enum" NOT NULL, "title" character varying NOT NULL, "description" text, "year" integer, "country" character varying, "technique" "public"."artwork_technique_enum", "genre" "public"."artwork_genre_enum", "physical_height" numeric(10,2), "physical_width" numeric(10,2), "physical_depth" numeric(10,2), "digital_height" integer, "digital_width" integer, "file_size" bigint, "materials" text, "tools" text, "tags" text array, "visibility" "public"."artwork_visibility_enum" NOT NULL DEFAULT 'PUBLIC', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "collection_id" integer, "user_id" integer NOT NULL, CONSTRAINT "PK_ee2e7c5ad7226179d4113a96fa8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "username" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "password_hash" character varying(255), "bio" character varying(255), "avatar_url" character varying(500), "google_id" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_7adac5c0b28492eb292d4a93871" UNIQUE ("google_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."token_type_enum" AS ENUM('refresh', 'email_verification', 'password_forgot')`,
    );
    await queryRunner.query(
      `CREATE TABLE "token" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "token" character varying(500) NOT NULL, "type" "public"."token_type_enum" NOT NULL, "used" boolean NOT NULL DEFAULT false, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f14413cd0a96dd8343ddc1a0cf" ON "token" ("type", "token") `,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_9e65ff974b18a9a565e57b6dde1" FOREIGN KEY ("artwork_id") REFERENCES "artwork"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD CONSTRAINT "FK_26e2ffe6290fa176022a403d01b" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD CONSTRAINT "FK_909d0cf9b5455a8ba1fe884de16" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "FK_e50ca89d635960fda2ffeb17639" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT "FK_e50ca89d635960fda2ffeb17639"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork" DROP CONSTRAINT "FK_909d0cf9b5455a8ba1fe884de16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork" DROP CONSTRAINT "FK_26e2ffe6290fa176022a403d01b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_9e65ff974b18a9a565e57b6dde1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f14413cd0a96dd8343ddc1a0cf"`,
    );
    await queryRunner.query(`DROP TABLE "token"`);
    await queryRunner.query(`DROP TYPE "public"."token_type_enum"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "artwork"`);
    await queryRunner.query(`DROP TYPE "public"."artwork_visibility_enum"`);
    await queryRunner.query(`DROP TYPE "public"."artwork_genre_enum"`);
    await queryRunner.query(`DROP TYPE "public"."artwork_technique_enum"`);
    await queryRunner.query(`DROP TYPE "public"."artwork_type_enum"`);
    await queryRunner.query(`DROP TABLE "image"`);
    await queryRunner.query(`DROP TYPE "public"."image_provider_enum"`);
    await queryRunner.query(`DROP TABLE "collection"`);
  }
}
