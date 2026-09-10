import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMovimentacoesDataTimestamptz1787833174189 implements MigrationInterface {
  name = 'AlterMovimentacoesDataTimestamptz1787833174189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes"
      ALTER COLUMN "data" TYPE timestamptz USING "data" AT TIME ZONE 'UTC';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes"
      ALTER COLUMN "data" TYPE timestamp USING "data" AT TIME ZONE 'UTC';
    `);
  }
}
