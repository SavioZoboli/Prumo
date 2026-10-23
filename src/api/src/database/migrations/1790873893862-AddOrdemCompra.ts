import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdemCompra1790873893862 implements MigrationInterface {
    name = "AddOrdemCompra1790873893862"
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE TABLE "Ordens_Compra"(
                    id smallint generated always as identity not null,
                    dt_emissao timestamptz not null default current_timestamp,
                    dt_entrega_prevista timestamptz,
                    dt_entrega timestamptz,
                    fornecedor_id smallint not null,
                    valor_total numeric(15,2),
                    constraint pk_ordens_compra primary key (id)
                );
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                DROP TABLE "Ordens_Compra";
            `);
  }
}
