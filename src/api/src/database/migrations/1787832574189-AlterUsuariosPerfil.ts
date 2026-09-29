import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsuariosPerfil1787832574189 implements MigrationInterface {
  name = 'AlterUsuariosPerfil1787832574189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Usuarios" ALTER COLUMN "perfil" TYPE varchar(10);
    `);

    await queryRunner.query(`
      UPDATE "Usuarios" SET "perfil" = 'USUARIO' WHERE "perfil" = 'USER';
    `);

    await queryRunner.query(`
      ALTER TABLE "Usuarios" ALTER COLUMN "perfil" SET DEFAULT 'USUARIO';
    `);

    await queryRunner.query(`
      ALTER TABLE "Usuarios"
        ADD CONSTRAINT "ck_usuario_perfil"
        CHECK ("perfil" IN ('ADMIN', 'LIDER', 'USUARIO'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Usuarios" DROP CONSTRAINT "ck_usuario_perfil";
    `);
    await queryRunner.query(`
      ALTER TABLE "Usuarios" ALTER COLUMN "perfil" SET DEFAULT 'USER';
    `);
    await queryRunner.query(`
      UPDATE "Usuarios" SET "perfil" = 'USER' WHERE "perfil" = 'USUARIO';
    `);
    await queryRunner.query(`
      ALTER TABLE "Usuarios" ALTER COLUMN "perfil" TYPE varchar(5);
    `);
  }
}
