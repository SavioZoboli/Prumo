import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokensInvalidadosEmUsuarios1787833574189 implements MigrationInterface {
  name = 'AddTokensInvalidadosEmUsuarios1787833574189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Usuarios" ADD COLUMN "tokens_invalidados_em" timestamptz;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Usuarios" DROP COLUMN "tokens_invalidados_em";
    `);
  }
}
