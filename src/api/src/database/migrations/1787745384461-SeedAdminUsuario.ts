import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAdminUsuario1787745384461 implements MigrationInterface {
    name = 'SeedAdminUsuario1787745384461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          INSERT INTO "Usuarios" (nome, sobrenome, email, usuario, senha, perfil, ativo)
          VALUES ('Admin', 'Prumo', 'admin@prumo.com', 'admin', '$2b$10$mp1QO9nPt5QklYQJh8IM5O7i4QQD6jZldrBnfQ7rUPWEZGkUjSmW6', 'ADMIN', true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "Usuarios" WHERE usuario = 'admin'`);
    }
}