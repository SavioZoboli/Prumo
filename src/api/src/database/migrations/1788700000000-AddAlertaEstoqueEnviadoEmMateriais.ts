import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAlertaEstoqueEnviadoEmMateriais1788700000000 implements MigrationInterface {
  name = 'AddAlertaEstoqueEnviadoEmMateriais1788700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Materiais" ADD COLUMN "alerta_estoque_enviado_em" timestamptz;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Materiais" DROP COLUMN "alerta_estoque_enviado_em";
    `);
  }
}
