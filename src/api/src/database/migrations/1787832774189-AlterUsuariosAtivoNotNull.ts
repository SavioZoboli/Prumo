import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsuariosAtivoNotNull1787832774189 implements MigrationInterface {
  name = 'AlterUsuariosAtivoNotNull1787832774189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "Usuarios" SET "ativo" = true WHERE "ativo" IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "Usuarios" ALTER COLUMN "ativo" SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Usuarios" ALTER COLUMN "ativo" DROP NOT NULL;
    `);
  }
}
