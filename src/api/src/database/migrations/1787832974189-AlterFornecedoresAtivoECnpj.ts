import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFornecedoresAtivoECnpj1787832974189 implements MigrationInterface {
  name = 'AlterFornecedoresAtivoECnpj1787832974189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "Fornecedores"
      SET "cnpj" = regexp_replace("cnpj", '\\D', '', 'g');
    `);

    await queryRunner.query(`
      UPDATE "Fornecedores" SET "is_ativo" = true WHERE "is_ativo" IS NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE "Fornecedores" ALTER COLUMN "is_ativo" SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Fornecedores" ALTER COLUMN "is_ativo" DROP NOT NULL;
    `);
  }
}
