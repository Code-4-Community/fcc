import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTask1754254886189 implements MigrationInterface {
  name = 'AddTask1754254886189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_category_enum" AS ENUM('Draft', 'To Do', 'In Progress', 'Completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "task" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "dateCreated" TIMESTAMP NOT NULL DEFAULT now(), "dueDate" TIMESTAMP, "labels" jsonb NOT NULL DEFAULT '[]', "category" "public"."tasks_category_enum" NOT NULL DEFAULT 'Draft', CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_category_enum"`);
  }
}
