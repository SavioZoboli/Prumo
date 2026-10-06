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

  private async liberarRecuperados(materiais: Material[]): Promise<void> {
    const ids = materiais
      .filter(
        (m) => m.estoqueAtual > m.estoqueMinimo && m.alertaEstoqueEnviadoEm,
      )
      .map((m) => m.id);

    if (ids.length === 0) return;

    await this.materialRepository.update(
      { id: In(ids) },
      { alertaEstoqueEnviadoEm: null, alertaEstoqueQuantidade: null },
    );
  }

  private async reservarCriticos(materiais: Material[]): Promise<Material[]> {
    const candidatos = materiais.filter(
      (m) =>
        m.ativo &&
        m.estoqueAtual <= m.estoqueMinimo &&
        (!m.alertaEstoqueEnviadoEm ||
          m.alertaEstoqueQuantidade === null ||
          m.estoqueAtual < m.alertaEstoqueQuantidade),
    );

    if (candidatos.length === 0) return [];

    const resultado = await this.materialRepository
      .createQueryBuilder()
      .update(Material)
      .set({
        alertaEstoqueEnviadoEm: () => 'now()',
        alertaEstoqueQuantidade: () => 'estoque_atual',
      })
      .where('id IN (:...ids)', { ids: candidatos.map((m) => m.id) })
      .andWhere(
        '(alerta_estoque_enviado_em IS NULL OR alerta_estoque_quantidade IS NULL OR estoque_atual < alerta_estoque_quantidade)',
      )
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

  private async desfazerReserva(materiais: Material[]): Promise<void> {
    for (const m of materiais) {
      await this.materialRepository.update(m.id, {
        alertaEstoqueEnviadoEm: m.alertaEstoqueEnviadoEm,
        alertaEstoqueQuantidade: m.alertaEstoqueQuantidade,
      });
    }
  }

  private montarAssunto(criticos: Material[]): string {
    if (criticos.length === 1) {
      return `[Prumo] Estoque mínimo atingido: ${criticos[0].nome} (${criticos[0].codigo})`;
    }
    return `[Prumo] Estoque mínimo atingido em ${criticos.length} materiais`;
  }

  private montarHtml(criticos: Material[]): string {
    const umSo = criticos.length === 1;
    const celula = 'padding:10px 12px;border-bottom:1px solid #e5e7eb';

    const linhas = criticos
      .map((m) => {
        const unidade = m.unidadeMedida
          ? ` ${escaparHtml(m.unidadeMedida)}`
          : '';
        const abaixo = m.estoqueAtual < m.estoqueMinimo;
        const status = abaixo
          ? '<span style="background:#fde2e2;color:#b42318;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:bold">Abaixo do mínimo</span>'
          : '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:bold">No mínimo</span>';

        return `
          <tr>
            <td style="${celula}">${escaparHtml(m.codigo)}</td>
            <td style="${celula}">${escaparHtml(m.nome)}</td>
            <td style="${celula};text-align:right;font-weight:bold">${m.estoqueAtual}${unidade}</td>
            <td style="${celula};text-align:right">${m.estoqueMinimo}${unidade}</td>
            <td style="${celula}">${status}</td>
          </tr>`;
      })
      .join('');

    const verificadoEm = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    });

    return `
      <div style="background:#f4f5f7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
        <table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px;border-collapse:separate;overflow:hidden">
          <tr>
            <td style="background:#1f3a5f;color:#ffffff;padding:16px 24px;font-size:18px;font-weight:bold">
              Prumo &middot; Alerta de estoque mínimo
            </td>
          </tr>
          <tr>
            <td style="padding:24px">
              <p style="margin:0 0 12px;font-size:15px">Olá,</p>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.5">
                ${
                  umSo
                    ? 'Identificamos que um material atingiu o <strong>estoque mínimo</strong> após uma movimentação no Prumo.'
                    : `Identificamos que <strong>${criticos.length} materiais</strong> atingiram o <strong>estoque mínimo</strong> após uma movimentação no Prumo.`
                }
                Para evitar a falta ${umSo ? 'desse item' : 'desses itens'} na produção, avalie a reposição o quanto antes.
              </p>

              <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
                <thead>
                  <tr style="background:#f3f4f6;text-align:left">
                    <th style="padding:10px 12px">Código</th>
                    <th style="padding:10px 12px">Material</th>
                    <th style="padding:10px 12px;text-align:right">Estoque atual</th>
                    <th style="padding:10px 12px;text-align:right">Estoque mínimo</th>
                    <th style="padding:10px 12px">Situação</th>
                  </tr>
                </thead>
                <tbody>${linhas}</tbody>
              </table>

              <p style="margin:0 0 6px;font-size:15px;font-weight:bold">Próximos passos</p>
              <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.6">
                <li>Confira o saldo atualizado na <strong>Consulta de estoque</strong> do Prumo.</li>
                <li>Se necessário, abra uma <strong>ordem de compra</strong> para repor ${umSo ? 'o material' : 'os materiais'}.</li>
              </ul>

              <p style="margin:0;font-size:12px;color:#6b7280">Situação verificada em ${verificadoEm}. Os valores podem ter mudado desde então.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:14px 24px;font-size:12px;color:#6b7280;line-height:1.5">
              Este é um e-mail automático do Prumo, enviado aos responsáveis pelo acompanhamento do estoque. Não é necessário respondê-lo.<br>
              Um novo aviso será enviado se o estoque cair ainda mais, ou se for reabastecido e voltar a atingir o mínimo.
            </td>
          </tr>
        </table>
      </div>
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
