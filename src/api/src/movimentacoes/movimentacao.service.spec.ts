import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovimentacaoService } from './movimentacao.service';
import { Movimentacao } from './movimentacao.entity';
import { Material } from '../materiais/material.entity';
import { AlertaEstoqueService } from '../alertas/alerta-estoque.service';

describe('MovimentacaoService — alerta de estoque mínimo', () => {
  let service: MovimentacaoService;
  let eventos: string[];

  const alertaEstoqueService = { verificarMateriais: jest.fn() };

  const manager = {
    getRepository: jest.fn(() => ({
      findOne: jest.fn(async () => ({
        id: 7,
        ativo: true,
        estoqueAtual: 12,
        estoqueMinimo: 10,
      })),
      save: jest.fn(async (m: unknown) => m),
    })),
    create: jest.fn((_entidade: unknown, dados: object) => dados),
    save: jest.fn(
      async (entidadeOuDados: unknown, dados?: unknown) =>
        dados ?? { ...(entidadeOuDados as object), id: 99 },
    ),
    transaction: jest.fn(async (cb: (m: unknown) => unknown) => {
      const resultado = await cb(manager);
      eventos.push('commit');
      return resultado;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    eventos = [];

    const modulo = await Test.createTestingModule({
      providers: [
        MovimentacaoService,
        { provide: getRepositoryToken(Movimentacao), useValue: { manager } },
        { provide: getRepositoryToken(Material), useValue: {} },
        { provide: AlertaEstoqueService, useValue: alertaEstoqueService },
      ],
    }).compile();

    service = modulo.get(MovimentacaoService);
  });

  const saida = {
    operacao: 'S',
    motivo: 'Uso na produção',
    itens: [{ material_id: 7, quantidade: 3 }],
  } as any;

  it('verifica o estoque dos materiais movimentados só depois do commit', async () => {
    alertaEstoqueService.verificarMateriais.mockImplementation(async () => {
      eventos.push('alerta');
    });

    await service.create(saida, 1);

    expect(alertaEstoqueService.verificarMateriais).toHaveBeenCalledWith([7]);
    expect(eventos).toEqual(['commit', 'alerta']);
  });

  it('conclui a movimentação sem esperar o envio do alerta', async () => {
    // Um SMTP que nunca responde não pode segurar a resposta da movimentação.
    alertaEstoqueService.verificarMateriais.mockReturnValue(
      new Promise(() => undefined),
    );

    await expect(service.create(saida, 1)).resolves.toMatchObject({ id: 99 });
  });
});
