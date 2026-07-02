import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailSubscribers1778800000002 implements MigrationInterface {
  name = 'AddEmailSubscribers1778800000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "email_subscribers" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "email" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "isSubscribed" boolean NOT NULL DEFAULT true, "unsubscribedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_email_subscriber_email" UNIQUE ("email"), CONSTRAINT "PK_email_subscribers" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_subscribers"`);
  }
}
