import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFornecedores1787681638849 implements MigrationInterface {
    name = 'CreateFornecedores1787681638849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Fornecedores" ("id" smallint GENERATED ALWAYS AS IDENTITY NOT NULL, "nome" character varying(40) NOT NULL, "cnpj" character varying(18) NOT NULL, "is_ativo" boolean DEFAULT true, CONSTRAINT "uq_cnpj" UNIQUE ("cnpj"), CONSTRAINT "pk_fornecedor" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Fornecedores"`);
    }

}
