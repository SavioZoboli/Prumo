import { MigrationInterface, QueryRunner } from "typeorm";

export class FKItensOcMateriais1790874764380 implements MigrationInterface {

    name="FKItensOcMateriais1790874764380"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                ALTER TABLE "Itens_Ordem_Compra"
                ADD CONSTRAINT fk_ioc_material
                FOREIGN KEY (material_id)
                REFERENCES "Materiais"(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE;
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Itens_Ordem_Compra"
            DROP CONSTRAINT fk_ioc_material;
            `);
    }

}
