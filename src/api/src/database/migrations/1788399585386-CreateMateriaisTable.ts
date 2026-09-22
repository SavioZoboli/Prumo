import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMateriaisTable1788399585386 implements MigrationInterface {
    name = 'CreateMateriaisTable1788399585386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Materiais" ("id" smallint GENERATED ALWAYS AS IDENTITY NOT NULL, "nome" character varying(30) NOT NULL, "codigo" character varying(20) NOT NULL, "equipamento" character varying(20) NOT NULL, "estoque_minimo" smallint NOT NULL, "estoque_atual" integer NOT NULL DEFAULT '0', "ativo" boolean NOT NULL DEFAULT true, "ultimo_valor" numeric(15,2), "unidade_medida" character varying(3), "localizacao" character varying(5), "fabricante_id" smallint NOT NULL, CONSTRAINT "pk_material" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Materiais"`);
    }

}
