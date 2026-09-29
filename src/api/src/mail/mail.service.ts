import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

export interface EnvioEmail {
  para?: string[];
  copiaOculta?: string[];
  assunto: string;
  html: string;
}

// Ponto único de envio de e-mail da API. A configuração de SMTP vem toda do
// .env (MAIL_*), então trocar o Mailpit local pelo servidor real não mexe em
// código. Quem chama recebe o erro do SMTP e decide o que fazer com ele.
@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly remetente: string;

  constructor(configService: ConfigService) {
    const usuario = configService.get<string>('MAIL_USER');

    this.transporter = createTransport({
      host: configService.get<string>('MAIL_HOST', 'localhost'),
      port: Number(configService.get<string>('MAIL_PORT', '1025')),
      secure: configService.get<string>('MAIL_SECURE') === 'true',
      auth: usuario
        ? { user: usuario, pass: configService.get<string>('MAIL_PASS') }
        : undefined,
    });

    this.remetente = configService.get<string>(
      'MAIL_FROM',
      'Prumo <nao-responda@prumo.local>',
    );
  }

  async enviar(email: EnvioEmail): Promise<string> {
    const info = await this.transporter.sendMail({
      from: this.remetente,
      to: email.para,
      bcc: email.copiaOculta,
      subject: email.assunto,
      html: email.html,
    });

    return info.messageId;
  }
}
