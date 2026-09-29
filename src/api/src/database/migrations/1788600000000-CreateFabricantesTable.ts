import { MigrationInterface, QueryRunner } from 'typeorm';


export class CreateFabricantesTable1788600000000 implements MigrationInterface {
  name = 'CreateFabricantesTable1788600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Fabricantes" (
        "id" smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
        "nome" character varying(40) NOT NULL,
        "is_ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "pk_fabricante" PRIMARY KEY ("id"),
        CONSTRAINT "uq_fabricante_nome" UNIQUE ("nome")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "Fabricantes" ("id", "nome") OVERRIDING SYSTEM VALUE
      VALUES (1, 'Sandvik'), (2, 'Seco'), (3, 'Walter'), (4, 'Kennametal'), (5, 'Iscar')
    `);

    await queryRunner.query(
      `ALTER TABLE "Fabricantes" ALTER COLUMN "id" RESTART WITH 6`,
    );

    await queryRunner.query(`
      ALTER TABLE "Materiais"
      ADD CONSTRAINT "fk_fabricante_material" FOREIGN KEY ("fabricante_id")
      REFERENCES "Fabricantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Materiais" DROP CONSTRAINT "fk_fabricante_material"`,
    );
    await queryRunner.query(`DROP TABLE "Fabricantes"`);
  }
}
