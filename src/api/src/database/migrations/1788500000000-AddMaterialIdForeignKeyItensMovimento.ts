import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaterialIdForeignKeyItensMovimento1788500000000 implements MigrationInterface {
    name = 'AddMaterialIdForeignKeyItensMovimento1788500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE "Itens_Movimento"
          ADD CONSTRAINT "fk_material_id" FOREIGN KEY ("material_id")
          REFERENCES "Materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Itens_Movimento" DROP CONSTRAINT "fk_material_id"`);
    }

}
