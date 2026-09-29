import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogsPerfil1787832674189 implements MigrationInterface {
  name = 'CreateLogsPerfil1787832674189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Logs_Perfil" (
        "id" smallint GENERATED ALWAYS AS IDENTITY,
        "operador_id" smallint NOT NULL,
        "alvo_id" smallint NOT NULL,
        "perfil_anterior" varchar(10) NOT NULL,
        "perfil_atual" varchar(10) NOT NULL,
        "data" timestamptz NOT NULL DEFAULT current_timestamp,
        CONSTRAINT "Logs_Perfil_pk" PRIMARY KEY ("id"),
        CONSTRAINT "fk_operador_id" FOREIGN KEY ("operador_id") REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_alvo_id" FOREIGN KEY ("alvo_id") REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "Logs_Perfil";`);
  }
}
