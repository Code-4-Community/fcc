import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameGoalColumns1781161660000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'targetAmount'`,
    );
    if (result.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "goals" RENAME COLUMN "targetAmount" TO "admin_target_amount"`,
      );
    } else {
      console.log(
        'Ignoring error: column targetAmount does not exist (likely already renamed)',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals" RENAME COLUMN "admin_target_amount" TO "targetAmount"`,
    );
  }
}
