import { MigrationInterface, QueryRunner } from "typeorm";

export class FKItensOcOc1790874759649 implements MigrationInterface {

    name = "FKItensOcOc1790874759649"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                ALTER TABLE "Itens_Ordem_Compra"
                ADD CONSTRAINT fk_ioc_oc
                FOREIGN KEY (ordem_compra_id)
                REFERENCES "Ordens_Compra"(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE;
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Itens_Ordem_Compra"
            DROP CONSTRAINT fk_ioc_oc;
            `);
    }

}
