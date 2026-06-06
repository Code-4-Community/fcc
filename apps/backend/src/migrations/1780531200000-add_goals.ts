import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoals1780531200000 implements MigrationInterface {
  name = 'AddGoals1780531200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "goals" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "targetAmount" integer NOT NULL, "title" text, "startDate" date, "endDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_goals" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "goals"`);
  }
}
