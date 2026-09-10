import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdemCompraIdMovimentacoes1787833274189 implements MigrationInterface {
  name = 'AddOrdemCompraIdMovimentacoes1787833274189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Decisao (Opcao A): recebimento de compra vira UM registro de
    // movimentacao por material recebido, cada um citando de qual Ordem de
    // Compra veio. Sem FK ainda: a tabela "Ordens_Compra" nao existe no
    // codigo (so tem front-end mockado, upstream/feature/cadastro-ordem-compra).
    // Quando ela existir, adicionar em migration separada:
    //   ALTER TABLE "Movimentacoes" ADD CONSTRAINT "fk_ordem_compra_baixa"
    //   FOREIGN KEY ("ordem_compra_id") REFERENCES "Ordens_Compra"("id")
    //   ON DELETE RESTRICT ON UPDATE CASCADE; -- convencao do diagrama
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
