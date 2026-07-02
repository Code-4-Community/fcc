import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailTemplates1778800000001 implements MigrationInterface {
  name = 'AddEmailTemplates1778800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "email_templates" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "type" character varying NOT NULL, "subject" character varying NOT NULL, "bodyHtml" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_email_template_type" UNIQUE ("type"), CONSTRAINT "PK_email_templates" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_templates"`);
  }
}
