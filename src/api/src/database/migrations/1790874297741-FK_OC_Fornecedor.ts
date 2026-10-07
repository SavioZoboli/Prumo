import { MigrationInterface, QueryRunner } from "typeorm";

export class FKOCFornecedor1790874297741 implements MigrationInterface {

    name="FKOCFornecedor1790874297741"

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
                ALTER TABLE "Ordens_Compra"
                ADD CONSTRAINT fk_oc_fornecedor
                FOREIGN KEY (fornecedor_id)
                REFERENCES "Fornecedores"(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE;
            `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                ALTER TABLE "Ordens_Compra"
                DROP CONSTRAINT fk_oc_fornecedor;
            `)
    }

}
