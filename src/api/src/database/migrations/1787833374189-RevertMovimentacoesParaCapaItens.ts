import { MigrationInterface, QueryRunner } from 'typeorm';

export class RevertMovimentacoesParaCapaItens1787833374189 implements MigrationInterface {
  name = 'RevertMovimentacoesParaCapaItens1787833374189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Volta pro modelo capa+itens do diagrama original: uma Movimentacao
    // pode envolver varios materiais (ex.: recebimento de compra com varios
    // itens de uma vez), em vez de ter material/quantidade fixos na capa.
    // Sem FK pra "Materiais" ainda: essa tabela nao existe no codigo
    // (PR do colega em revisao). Adicionar em migration separada quando existir:
    //   ALTER TABLE "Itens_Movimento" ADD CONSTRAINT "fk_material_id"
    //   FOREIGN KEY ("material_id") REFERENCES "Materiais"("id");
    await queryRunner.query(`
      CREATE TABLE "Itens_Movimento" (
        "movimento_id" smallint NOT NULL,
        "material_id" smallint NOT NULL,
        "quantidade" integer NOT NULL,
        CONSTRAINT "Itens_Movimento_pk" PRIMARY KEY ("movimento_id", "material_id"),
        CONSTRAINT "fk_movimento_id" FOREIGN KEY ("movimento_id") REFERENCES "Movimentacoes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `);

    // Preserva dado existente (linhas de teste ja tinham material_id/quantidade
    // direto na capa) migrando pra Itens_Movimento antes de derrubar as colunas.
    await queryRunner.query(`
      INSERT INTO "Itens_Movimento" ("movimento_id", "material_id", "quantidade")
      SELECT "id", "material_id", "quantidade" FROM "Movimentacoes";
    `);

    await queryRunner.query(`
      ALTER TABLE "Movimentacoes" DROP COLUMN "material_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes" DROP COLUMN "quantidade";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes" ADD COLUMN "material_id" smallint;
    `);
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes" ADD COLUMN "quantidade" smallint;
    `);

    // So reverte de forma exata quando cada movimentacao tinha exatamente
    // um item (o caso de antes desta migration). Uma movimentacao com
    // varios itens perde dado ao reverter — nao ha como voltar pro formato
    // "um material por linha" sem decidir qual item vira o unico.
    await queryRunner.query(`
      UPDATE "Movimentacoes" m
      SET "material_id" = im."material_id", "quantidade" = im."quantidade"
      FROM "Itens_Movimento" im
      WHERE im."movimento_id" = m."id";
    `);

    await queryRunner.query(`
      ALTER TABLE "Movimentacoes" ALTER COLUMN "material_id" SET NOT NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes" ALTER COLUMN "quantidade" SET NOT NULL;
    `);

    await queryRunner.query(`
      DROP TABLE "Itens_Movimento";
    `);
  }
}
