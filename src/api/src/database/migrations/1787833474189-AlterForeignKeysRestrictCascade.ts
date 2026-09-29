import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Padroniza as FKs com ON DELETE RESTRICT / ON UPDATE CASCADE, seguindo a
 * convencao ja usada no diagrama (docs/diagram/diagrama_er.dbm) desde o
 * desenho original: nao deixa apagar uma linha referenciada (RESTRICT),
 * mas acompanha a chave se o id referenciado mudar (CASCADE). As migrations
 * anteriores criaram essas 4 FKs sem essa clausula (NO ACTION/NO ACTION);
 * esta migration derruba e recria cada uma so com a acao trocada.
 */
export class AlterForeignKeysRestrictCascade1787833474189 implements MigrationInterface {
  name = 'AlterForeignKeysRestrictCascade1787833474189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Movimentacoes" DROP CONSTRAINT "fk_usuario_id"`);
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes"
      ADD CONSTRAINT "fk_usuario_id" FOREIGN KEY ("usuario_id")
      REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`ALTER TABLE "Logs_Perfil" DROP CONSTRAINT "fk_operador_id"`);
    await queryRunner.query(`
      ALTER TABLE "Logs_Perfil"
      ADD CONSTRAINT "fk_operador_id" FOREIGN KEY ("operador_id")
      REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`ALTER TABLE "Logs_Perfil" DROP CONSTRAINT "fk_alvo_id"`);
    await queryRunner.query(`
      ALTER TABLE "Logs_Perfil"
      ADD CONSTRAINT "fk_alvo_id" FOREIGN KEY ("alvo_id")
      REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`ALTER TABLE "Itens_Movimento" DROP CONSTRAINT "fk_movimento_id"`);
    await queryRunner.query(`
      ALTER TABLE "Itens_Movimento"
      ADD CONSTRAINT "fk_movimento_id" FOREIGN KEY ("movimento_id")
      REFERENCES "Movimentacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Itens_Movimento" DROP CONSTRAINT "fk_movimento_id"`);
    await queryRunner.query(`
      ALTER TABLE "Itens_Movimento"
      ADD CONSTRAINT "fk_movimento_id" FOREIGN KEY ("movimento_id")
      REFERENCES "Movimentacoes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`ALTER TABLE "Logs_Perfil" DROP CONSTRAINT "fk_alvo_id"`);
    await queryRunner.query(`
      ALTER TABLE "Logs_Perfil"
      ADD CONSTRAINT "fk_alvo_id" FOREIGN KEY ("alvo_id")
      REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`ALTER TABLE "Logs_Perfil" DROP CONSTRAINT "fk_operador_id"`);
    await queryRunner.query(`
      ALTER TABLE "Logs_Perfil"
      ADD CONSTRAINT "fk_operador_id" FOREIGN KEY ("operador_id")
      REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`ALTER TABLE "Movimentacoes" DROP CONSTRAINT "fk_usuario_id"`);
    await queryRunner.query(`
      ALTER TABLE "Movimentacoes"
      ADD CONSTRAINT "fk_usuario_id" FOREIGN KEY ("usuario_id")
      REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }
}
