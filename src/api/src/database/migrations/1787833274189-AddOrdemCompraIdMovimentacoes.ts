import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdemCompraIdMovimentacoes1787833274189 implements MigrationInterface {
  name = 'AddOrdemCompraIdMovimentacoes1787833274189';

  public async up(queryRunner: QueryRunner): Promise<void> {
  
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes" ADD COLUMN "ordem_compra_id" smallint;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes" DROP COLUMN "ordem_compra_id";
    `);
  }
}
