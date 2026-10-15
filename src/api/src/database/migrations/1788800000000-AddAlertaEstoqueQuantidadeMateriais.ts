import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAlertaEstoqueQuantidadeMateriais1788800000000 implements MigrationInterface {
  name = 'AddAlertaEstoqueQuantidadeMateriais1788800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Materiais" ADD COLUMN "alerta_estoque_quantidade" integer;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Materiais" DROP COLUMN "alerta_estoque_quantidade";
    `);
  }
}
