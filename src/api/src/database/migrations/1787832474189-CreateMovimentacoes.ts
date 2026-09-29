import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMovimentacoes1787832474189 implements MigrationInterface {
    name = 'CreateMovimentacoes1787832474189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Movimentacoes" ("id" smallint GENERATED ALWAYS AS IDENTITY NOT NULL, "data" TIMESTAMP NOT NULL, "operacao" character varying(1) NOT NULL, "quantidade" smallint NOT NULL, "motivo" text NOT NULL, "usuario_id" smallint NOT NULL, "material_id" smallint NOT NULL, "ordem_producao" character varying(100), "is_estornado" boolean NOT NULL DEFAULT false, "motivo_estorno" character varying(100), CONSTRAINT "pk_movimentacoes" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Movimentacoes" ADD CONSTRAINT "fk_usuario_id" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Movimentacoes" DROP CONSTRAINT "fk_usuario_id"`);
        await queryRunner.query(`DROP TABLE "Movimentacoes"`);
    }

}
