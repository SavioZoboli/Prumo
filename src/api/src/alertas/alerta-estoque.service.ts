import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Material } from '../materiais/material.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { PerfilUsuario } from '../usuarios/perfil.enum';
import { MailService } from '../mail/mail.service';

// Perfis que acompanham o estoque e recebem o alerta (RN05/RF08).
const PERFIS_RESPONSAVEIS = [PerfilUsuario.ADMIN, PerfilUsuario.LIDER];

@Injectable()
export class AlertaEstoqueService {
  private readonly logger = new Logger(AlertaEstoqueService.name);

  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly mailService: MailService,
  ) {}

  // Confere os materiais cujo estoque acabou de mudar. Nunca lança: é chamado
  // depois do commit da movimentação e uma falha aqui (banco ou SMTP) não
  // pode desfazer nem travar a operação de quem chamou.
  async verificarMateriais(ids: number[]): Promise<void> {
    const idsUnicos = [...new Set(ids)];
    if (idsUnicos.length === 0) return;

    try {
      const materiais = await this.materialRepository.find({
        where: { id: In(idsUnicos) },
      });

      await this.liberarRecuperados(materiais);

      const criticos = await this.reservarCriticos(materiais);
      if (criticos.length === 0) return;

      await this.enviarAlerta(criticos);
    } catch (erro) {
      this.logger.error(
        `Falha ao verificar estoque mínimo dos materiais [${idsUnicos.join(', ')}]`,
        erro instanceof Error ? erro.stack : String(erro),
      );
    }
  }

  // Estoque voltou a ficar acima do mínimo: limpa a marca para que uma nova
  // queda gere um novo alerta.
  private async liberarRecuperados(materiais: Material[]): Promise<void> {
    const ids = materiais
      .filter(
        (m) => m.estoqueAtual > m.estoqueMinimo && m.alertaEstoqueEnviadoEm,
      )
      .map((m) => m.id);

    if (ids.length === 0) return;

    await this.materialRepository.update(
      { id: In(ids) },
      { alertaEstoqueEnviadoEm: null },
    );
  }

  // Marca como alertados, numa única instrução condicional, os materiais que
  // estão no mínimo ou abaixo e ainda não foram alertados. Duas movimentações
  // simultâneas do mesmo material disputam essa linha e só uma delas leva o
  // material — é isso que evita e-mail em duplicidade.
  private async reservarCriticos(materiais: Material[]): Promise<Material[]> {
    const candidatos = materiais.filter(
      (m) =>
        m.ativo &&
        m.estoqueAtual <= m.estoqueMinimo &&
        !m.alertaEstoqueEnviadoEm,
    );

    if (candidatos.length === 0) return [];

    const resultado = await this.materialRepository
      .createQueryBuilder()
      .update(Material)
      .set({ alertaEstoqueEnviadoEm: () => 'now()' })
      .where('id IN (:...ids)', { ids: candidatos.map((m) => m.id) })
      .andWhere('alerta_estoque_enviado_em IS NULL')
      .andWhere('ativo = true')
      .andWhere('estoque_atual <= estoque_minimo')
      .returning('id')
      .execute();

    const reservados = new Set(
      (resultado.raw as { id: number }[]).map((linha) => Number(linha.id)),
    );

    return candidatos.filter((m) => reservados.has(m.id));
  }

  private async enviarAlerta(criticos: Material[]): Promise<void> {
    const codigos = criticos.map((m) => m.codigo).join(', ');

    const destinatarios = await this.usuarioRepository.find({
      select: { email: true },
      where: { ativo: true, perfil: In(PERFIS_RESPONSAVEIS) },
    });

    if (destinatarios.length === 0) {
      this.logger.warn(
        `Materiais no estoque mínimo [${codigos}], mas não há usuários ADMIN/LIDER ativos para receber o alerta.`,
      );
      await this.desfazerReserva(criticos);
      return;
    }

    try {
      const messageId = await this.mailService.enviar({
        copiaOculta: destinatarios.map((u) => u.email),
        assunto: this.montarAssunto(criticos),
        html: this.montarHtml(criticos),
      });

      this.logger.log(
        `Alerta de estoque mínimo enviado [${codigos}] para ${destinatarios.length} destinatário(s). messageId=${messageId}`,
      );
    } catch (erro) {
      this.logger.error(
        `Falha ao enviar alerta de estoque mínimo [${codigos}]. Um novo envio será tentado na próxima movimentação.`,
        erro instanceof Error ? erro.stack : String(erro),
      );
      await this.desfazerReserva(criticos);
    }
  }

  // Sem o envio confirmado, a marca não pode ficar: senão o material nunca
  // mais seria alertado enquanto continuar crítico.
  private async desfazerReserva(materiais: Material[]): Promise<void> {
    await this.materialRepository.update(
      { id: In(materiais.map((m) => m.id)) },
      { alertaEstoqueEnviadoEm: null },
    );
  }

  private montarAssunto(criticos: Material[]): string {
    if (criticos.length === 1) {
      return `[Prumo] Estoque mínimo atingido: ${criticos[0].nome} (${criticos[0].codigo})`;
    }
    return `[Prumo] Estoque mínimo atingido em ${criticos.length} materiais`;
  }

  private montarHtml(criticos: Material[]): string {
    const linhas = criticos
      .map(
        (m) => `
        <tr>
          <td style="padding:6px 12px;border:1px solid #ddd">${escaparHtml(m.codigo)}</td>
          <td style="padding:6px 12px;border:1px solid #ddd">${escaparHtml(m.nome)}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${m.estoqueAtual}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${m.estoqueMinimo}</td>
        </tr>`,
      )
      .join('');

    return `
      <p>Os materiais abaixo estão com o estoque igual ou inferior ao mínimo e precisam de reposição:</p>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <thead>
          <tr style="background:#f3f3f3">
            <th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Código</th>
            <th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Material</th>
            <th style="padding:6px 12px;border:1px solid #ddd">Estoque atual</th>
            <th style="padding:6px 12px;border:1px solid #ddd">Estoque mínimo</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
      <p style="color:#777;font-size:12px">Alerta automático do Prumo. Um novo aviso só será enviado se o estoque for reabastecido e voltar a atingir o mínimo.</p>
    `;
  }
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
