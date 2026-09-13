import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuarios1787130000000 implements MigrationInterface {
  name = 'CreateUsuarios1787130000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Usuarios" (
        "id" smallint GENERATED ALWAYS AS IDENTITY,
        "nome" varchar(30) NOT NULL,
        "sobrenome" varchar(30) NOT NULL,
        "email" varchar(60) NOT NULL,
        "usuario" varchar(50) NOT NULL,
        "senha" varchar(100) NOT NULL,
        "perfil" varchar(5) NOT NULL DEFAULT 'USER',
        "ativo" boolean DEFAULT true,
        CONSTRAINT "pk_usuario" PRIMARY KEY ("id"),
        CONSTRAINT "uq_usuario" UNIQUE ("usuario"),
        CONSTRAINT "uq_email" UNIQUE ("email")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "Usuarios";`);
  }
}
