import { MigrationInterface, QueryRunner } from "typeorm";

export class AddItensOrdemCompra1790874305935 implements MigrationInterface {

    name = "AddItensOrdemCompra1790874305935"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE TABLE "Itens_Ordem_Compra"(
                    ordem_compra_id smallint not null,
                    material_id smallint not null,
                    quantidade int not null,
                    valor numeric(15,2) not null,
                    CONSTRAINT pk_itens_oc PRIMARY KEY (ordem_compra_id,material_id)
                )
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                DROP TABLE "Itens_Ordem_Compra";
            `)
    }

}
