import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDonations1758917198934 implements MigrationInterface {
  name = 'AddDonations1758917198934';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "donations" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "isAnonymous" boolean NOT NULL DEFAULT false, "donationType" integer NOT NULL, "recurringInterval" character varying, "dedicationMessage" character varying, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_c01355d6f6f50fc6d1b4a946abf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" integer NOT NULL, "status" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "donations"`);
  }
}
