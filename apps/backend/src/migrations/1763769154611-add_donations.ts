import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDonations1763769154611 implements MigrationInterface {
  name = 'AddDonations1763769154611';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "donations" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "amount" integer NOT NULL, "isAnonymous" boolean NOT NULL DEFAULT false, "donationType" character varying NOT NULL, "recurringInterval" character varying, "dedicationMessage" character varying, "showDedicationPublicly" boolean NOT NULL DEFAULT false, "status" character varying NOT NULL DEFAULT 'pending', "transactionId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c01355d6f6f50fc6d1b4a946abf" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "donations"`);
  }
}
