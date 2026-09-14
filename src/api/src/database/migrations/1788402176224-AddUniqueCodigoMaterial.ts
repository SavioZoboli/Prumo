import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueCodigoMaterial1788402176224 implements MigrationInterface {
    name = 'AddUniqueCodigoMaterial1788402176224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Materiais" ADD CONSTRAINT "UQ_10f32e57496c0bb8cf4993b16c2" UNIQUE ("codigo")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Materiais" DROP CONSTRAINT "UQ_10f32e57496c0bb8cf4993b16c2"`);
    }

}
