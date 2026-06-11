import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameGoalColumns1781161660000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals" RENAME COLUMN "targetAmount" TO "admin_target_amount"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals" RENAME COLUMN "admin_target_amount" TO "targetAmount"`,
    );
  }
}
