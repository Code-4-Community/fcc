import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDonations1759151447065 implements MigrationInterface {
  name = 'AddDonations1759151447065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "donations" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "isAnonymous" boolean NOT NULL DEFAULT false, "donationType" integer NOT NULL, "recurringInterval" integer, "dedicationMessage" character varying, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_c01355d6f6f50fc6d1b4a946abf" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "donations"`);
  }
}
