import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovimentacaoService } from './movimentacao.service';
import { Movimentacao } from './movimentacao.entity';
import { Material } from '../materiais/material.entity';
import { AlertaEstoqueService } from '../alertas/alerta-estoque.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

describe('MovimentacaoService — alerta de estoque mínimo', () => {
  let service: MovimentacaoService;
  let eventos: string[];
  let materialMock: Material;

  // Mock utilizado apenas nos testes para validar o acionamento do serviço de alerta.
  const alertaEstoqueService = {
    verificarMateriais: jest.fn<(ids: number[]) => Promise<void>>(),
  };

  // Mock do repositório de materiais utilizado dentro da transação.
  const materialRepository = {
    findOne: jest.fn<() => Promise<Material | null>>(),
    save: jest.fn<(materiais: Material[]) => Promise<Material[]>>(),
  };

  const managerBase = {
    getRepository: jest.fn(() => materialRepository),

    create: jest.fn<(entidade: unknown, dados: object) => object>(
      (_entidade, dados) => dados,
    ),

    save: jest.fn<
      (entidadeOuDados: unknown, dados?: unknown) => Promise<unknown>
    >((entidadeOuDados, dados) =>
      Promise.resolve(
        dados ?? {
          ...(entidadeOuDados as object),
          id: 99,
        },
      ),
    ),
  };

  const transaction =
    jest.fn<
      (
        callback: (manager: typeof managerBase) => Promise<unknown>,
      ) => Promise<unknown>
    >();

  const manager = {
    ...managerBase,
    transaction,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    eventos = [];

    alertaEstoqueService.verificarMateriais.mockResolvedValue(undefined);

    // Material simulado com estoque inicialmente acima do mínimo.
    materialMock = {
      id: 7,
      ativo: true,
      estoqueAtual: 12,
      estoqueMinimo: 10,
    } as Material;

    materialRepository.findOne.mockResolvedValue(materialMock);

    materialRepository.save.mockImplementation((materiais) =>
      Promise.resolve(materiais),
    );

    transaction.mockImplementation(async (callback) => {
      const resultado = await callback(managerBase);
      eventos.push('commit');
      return resultado;
    });

    const modulo = await Test.createTestingModule({
      providers: [
        MovimentacaoService,
        {
          provide: getRepositoryToken(Movimentacao),
          useValue: { manager },
        },
        {
          provide: getRepositoryToken(Material),
          useValue: {},
        },
        {
          provide: AlertaEstoqueService,
          useValue: alertaEstoqueService,
        },
      ],
    }).compile();

    service = modulo.get(MovimentacaoService);
  });

  const saida: CreateMovimentacaoDto = {
    operacao: 'S',
    motivo: 'Uso na produção',
    itens: [{ material_id: 7, quantidade: 3 }],
  };

  it('verifica o estoque dos materiais movimentados só depois do commit', async () => {
    alertaEstoqueService.verificarMateriais.mockImplementation(() => {
      eventos.push('alerta');
      return Promise.resolve();
    });

    await service.create(saida, 1);

    expect(alertaEstoqueService.verificarMateriais).toHaveBeenCalledWith([7]);
    expect(eventos).toEqual(['commit', 'alerta']);
  });

  it('conclui a movimentação sem esperar o envio do alerta', async () => {
    // Um SMTP que nunca responde não pode segurar a resposta da movimentação.
    alertaEstoqueService.verificarMateriais.mockReturnValue(
      new Promise<void>(() => undefined),
    );

    await expect(service.create(saida, 1)).resolves.toMatchObject({
      id: 99,
    });
  });

  it('verifica o alerta quando uma saída faz o estoque atingir o mínimo', async () => {
    const saidaAteOMinimo: CreateMovimentacaoDto = {
      operacao: 'S',
      motivo: 'Uso na produção',
      itens: [{ material_id: 7, quantidade: 2 }],
    };

    await service.create(saidaAteOMinimo, 1);

    expect(materialRepository.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 7,
          estoqueAtual: 10,
          estoqueMinimo: 10,
        }),
      ]),
    );

    expect(alertaEstoqueService.verificarMateriais).toHaveBeenCalledWith([7]);
  });

  it('verifica o alerta quando uma saída deixa o estoque abaixo do mínimo', async () => {
    await service.create(saida, 1);

    expect(materialRepository.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 7,
          estoqueAtual: 9,
          estoqueMinimo: 10,
        }),
      ]),
    );

    expect(alertaEstoqueService.verificarMateriais).toHaveBeenCalledWith([7]);
  });
});
