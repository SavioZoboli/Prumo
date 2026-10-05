import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { AlertaEstoqueService } from './alerta-estoque.service';
import { Material } from '../materiais/material.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { EnvioEmail, MailService } from '../mail/mail.service';

function material(dados: Partial<Material>): Material {
  return {
    id: 1,
    nome: 'Pastilha CNMG',
    codigo: 'CNMG120408',
    estoqueAtual: 5,
    estoqueMinimo: 10,
    ativo: true,
    alertaEstoqueEnviadoEm: null,
    alertaEstoqueQuantidade: null,
    ...dados,
  } as Material;
}

describe('AlertaEstoqueService', () => {
  let service: AlertaEstoqueService;
  let materiais: Material[];
  let idsReservados: number[];

  const execute = jest.fn();
  const queryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute,
  };
  const materialRepository = {
    find: jest.fn(async () => materiais),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };
  const usuarioRepository = {
    find: jest.fn(async () => [
      { email: 'admin@prumo.local' },
      { email: 'lider@prumo.local' },
    ]),
  };
  const mailService = {
    enviar: jest.fn((_email: EnvioEmail) => Promise.resolve('<id@prumo>')),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    materiais = [];
    idsReservados = [];
    // Simula o UPDATE condicional: reserva só o que está em idsReservados.
    execute.mockImplementation(async () => ({
      raw: idsReservados.map((id) => ({ id })),
    }));

    const modulo = await Test.createTestingModule({
      providers: [
        AlertaEstoqueService,
        { provide: getRepositoryToken(Material), useValue: materialRepository },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepository },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = modulo.get(AlertaEstoqueService);
  });

  it('envia alerta quando o material atinge o mínimo, com os dados do material', async () => {
    materiais = [material({ estoqueAtual: 10, estoqueMinimo: 10 })];
    idsReservados = [1];

    await service.verificarMateriais([1]);

    expect(mailService.enviar).toHaveBeenCalledTimes(1);
    const email = mailService.enviar.mock.calls[0][0];
    expect(email.copiaOculta).toEqual([
      'admin@prumo.local',
      'lider@prumo.local',
    ]);
    expect(email.assunto).toContain('CNMG120408');
    expect(email.html).toContain('Pastilha CNMG');
    expect(email.html).toContain('CNMG120408');
    expect(email.html).toContain('>10<');
  });

  it('manda um único e-mail para vários materiais da mesma movimentação', async () => {
    materiais = [material({ id: 1 }), material({ id: 2, codigo: 'FRESA010' })];
    idsReservados = [1, 2];

    await service.verificarMateriais([1, 2, 2]);

    expect(mailService.enviar).toHaveBeenCalledTimes(1);
    expect(mailService.enviar.mock.calls[0][0].html).toContain('FRESA010');
  });

  it('não reenvia se o estoque não caiu desde o último alerta', async () => {
    materiais = [
      material({
        estoqueAtual: 5,
        alertaEstoqueEnviadoEm: new Date(),
        alertaEstoqueQuantidade: 5,
      }),
    ];

    await service.verificarMateriais([1]);

    expect(queryBuilder.execute).not.toHaveBeenCalled();
    expect(mailService.enviar).not.toHaveBeenCalled();
  });

  it('entrada que não tira da situação crítica não gera alerta', async () => {
    // Alertado com 5, entrou material e foi para 8: continua crítico, mas melhorou.
    materiais = [
      material({
        estoqueAtual: 8,
        alertaEstoqueEnviadoEm: new Date(),
        alertaEstoqueQuantidade: 5,
      }),
    ];

    await service.verificarMateriais([1]);

    expect(mailService.enviar).not.toHaveBeenCalled();
  });

  it('reenvia quando o material já alertado cai ainda mais', async () => {
    // Caso real: BROCA08 alertado com 20/20 e depois saiu para 19.
    materiais = [
      material({
        estoqueAtual: 19,
        estoqueMinimo: 20,
        alertaEstoqueEnviadoEm: new Date(),
        alertaEstoqueQuantidade: 20,
      }),
    ];
    idsReservados = [1];

    await service.verificarMateriais([1]);

    expect(mailService.enviar).toHaveBeenCalledTimes(1);
    expect(queryBuilder.set).toHaveBeenCalledWith(
      expect.objectContaining({
        alertaEstoqueQuantidade: expect.any(Function),
      }),
    );
  });

  it('alerta material marcado antes de existir a quantidade de referência', async () => {
    materiais = [
      material({
        alertaEstoqueEnviadoEm: new Date(),
        alertaEstoqueQuantidade: null,
      }),
    ];
    idsReservados = [1];

    await service.verificarMateriais([1]);

    expect(mailService.enviar).toHaveBeenCalledTimes(1);
  });

  it('não envia se outra verificação simultânea já reservou o material', async () => {
    materiais = [material({})];
    idsReservados = [];

    await service.verificarMateriais([1]);

    expect(mailService.enviar).not.toHaveBeenCalled();
  });

  it('libera novo alerta quando o estoque é reabastecido acima do mínimo', async () => {
    materiais = [
      material({
        estoqueAtual: 30,
        alertaEstoqueEnviadoEm: new Date(),
        alertaEstoqueQuantidade: 5,
      }),
    ];

    await service.verificarMateriais([1]);

    expect(materialRepository.update).toHaveBeenCalledWith(expect.anything(), {
      alertaEstoqueEnviadoEm: null,
      alertaEstoqueQuantidade: null,
    });
    expect(mailService.enviar).not.toHaveBeenCalled();
  });

  it('não alerta material acima do mínimo', async () => {
    materiais = [material({ estoqueAtual: 11 })];

    await service.verificarMateriais([1]);

    expect(mailService.enviar).not.toHaveBeenCalled();
  });

  it('não alerta material inativo', async () => {
    materiais = [material({ ativo: false })];

    await service.verificarMateriais([1]);

    expect(queryBuilder.execute).not.toHaveBeenCalled();
    expect(mailService.enviar).not.toHaveBeenCalled();
  });

  it('falha no SMTP não lança e desfaz a marca para tentar de novo depois', async () => {
    materiais = [material({})];
    idsReservados = [1];
    mailService.enviar.mockRejectedValueOnce(new Error('SMTP fora do ar'));

    await expect(service.verificarMateriais([1])).resolves.toBeUndefined();

    expect(materialRepository.update).toHaveBeenCalledWith(1, {
      alertaEstoqueEnviadoEm: null,
      alertaEstoqueQuantidade: null,
    });
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('falha no reenvio devolve a marca do alerta anterior, não a apaga', async () => {
    const alertaAnterior = new Date('2026-09-29T14:11:55Z');
    materiais = [
      material({
        estoqueAtual: 3,
        alertaEstoqueEnviadoEm: alertaAnterior,
        alertaEstoqueQuantidade: 5,
      }),
    ];
    idsReservados = [1];
    mailService.enviar.mockRejectedValueOnce(new Error('SMTP fora do ar'));

    await service.verificarMateriais([1]);

    expect(materialRepository.update).toHaveBeenCalledWith(1, {
      alertaEstoqueEnviadoEm: alertaAnterior,
      alertaEstoqueQuantidade: 5,
    });
  });

  it('sem destinatários, não envia e desfaz a marca', async () => {
    materiais = [material({})];
    idsReservados = [1];
    usuarioRepository.find.mockResolvedValueOnce([]);

    await service.verificarMateriais([1]);

    expect(mailService.enviar).not.toHaveBeenCalled();
    expect(materialRepository.update).toHaveBeenCalledWith(1, {
      alertaEstoqueEnviadoEm: null,
      alertaEstoqueQuantidade: null,
    });
  });

  it('erro no banco não lança', async () => {
    materialRepository.find.mockRejectedValueOnce(new Error('conexão perdida'));

    await expect(service.verificarMateriais([1])).resolves.toBeUndefined();
  });

  it('escapa HTML vindo do cadastro do material', async () => {
    materiais = [material({ nome: '<script>x</script>' })];
    idsReservados = [1];

    await service.verificarMateriais([1]);

    const html = mailService.enviar.mock.calls[0][0].html as string;
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
