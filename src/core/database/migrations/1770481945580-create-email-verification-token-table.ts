import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailVerificationTokenTable1770481945580 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_verification_token" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "token" character varying(255) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2a908516a5e0251ceca4d2bdad0" UNIQUE ("token"), CONSTRAINT "PK_8a4ba9e58712768183e862529f6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_token" ADD CONSTRAINT "FK_b9ff7bf0d4ef247fff0d33f6ac0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_verification_token" DROP CONSTRAINT "FK_b9ff7bf0d4ef247fff0d33f6ac0"`,
    );
    await queryRunner.query(`DROP TABLE "email_verification_token"`);
  }
}
