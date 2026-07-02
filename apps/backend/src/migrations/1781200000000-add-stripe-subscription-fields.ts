import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripeSubscriptionFields1781200000000 implements MigrationInterface {
  name = 'AddStripeSubscriptionFields1781200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // feeAmount was added to the Donation entity in a prior change without a
    // migration; add it here (guarded) so the schema matches the entity.
    await queryRunner.query(
      `ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "feeAmount" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "stripeCustomerId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "donations" DROP COLUMN IF EXISTS "stripeCustomerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "donations" DROP COLUMN IF EXISTS "stripeSubscriptionId"`,
    );
    // Note: feeAmount is intentionally not dropped here since it predates this
    // migration conceptually; drop manually if a full revert is required.
  }
}
