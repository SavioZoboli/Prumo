import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMovimentacoesDataTimestamptz1787833174189 implements MigrationInterface {
  name = 'AlterMovimentacoesDataTimestamptz1787833174189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // "timestamp" (sem timezone) gera ambiguidade se app e banco rodarem em
    // fusos diferentes. Assume que os valores gravados ate aqui sao UTC
    // (e' o que o driver do Postgres grava por padrao a partir de um Date do Node).
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
