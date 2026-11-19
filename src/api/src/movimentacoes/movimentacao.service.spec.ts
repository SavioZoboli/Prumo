
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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

  const alertaEstoqueService = {
    verificarMateriais: jest.fn<(ids: number[]) => Promise<void>>(),
  };

  // Mock do QueryBuilder utilizado para simular o bloqueio dos materiais.
  const materialQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    getMany: jest.fn<() => Promise<Material[]>>(),
  };

  // Mock do repositório de materiais.
  const materialRepository = {
    createQueryBuilder: jest.fn(() => materialQueryBuilder),

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

    // Resultado padrão da consulta com bloqueio pessimista.
    materialQueryBuilder.getMany.mockResolvedValue([materialMock]);

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

  describe('trava do saldo (saídas simultâneas)', () => {
    it('lê e trava os materiais dentro da transação, antes de gravar o saldo', async () => {
      materialQueryBuilder.getMany.mockImplementation(() => {
        eventos.push('trava');
        return Promise.resolve([materialMock]);
      });

      materialRepository.save.mockImplementation((materiais) => {
        eventos.push('grava');
        return Promise.resolve(materiais);
      });

      await service.create(saida, 1);

      expect(eventos).toEqual(['trava', 'grava', 'commit']);
    });

    it('trava os materiais em ordem crescente de id, qualquer que seja a ordem do pedido', async () => {
      materialQueryBuilder.getMany.mockResolvedValue([
        { ...materialMock, id: 7 } as Material,
        { ...materialMock, id: 9 } as Material,
      ]);

      await service.create(
        {
          operacao: 'S',
          motivo: 'Uso na produção',
          itens: [
            { material_id: 9, quantidade: 1 },
            { material_id: 7, quantidade: 1 },
          ],
        },
        1,
      );

      expect(materialRepository.createQueryBuilder).toHaveBeenCalledWith(
        'material',
      );

      expect(materialQueryBuilder.where).toHaveBeenCalledWith(
        'material.id IN (:...ids)',
        { ids: [7, 9] },
      );

      expect(materialQueryBuilder.orderBy).toHaveBeenCalledWith(
        'material.id',
        'ASC',
      );

      expect(materialQueryBuilder.setLock).toHaveBeenCalledWith(
        'pessimistic_write',
      );
    });

    it('recusa a saída maior que o saldo lido sob a trava, sem gravar nada', async () => {
      await expect(
        service.create(
          {
            operacao: 'S',
            motivo: 'Uso na produção',
            itens: [{ material_id: 7, quantidade: 13 }],
          },
          1,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(materialRepository.save).not.toHaveBeenCalled();
      expect(alertaEstoqueService.verificarMateriais).not.toHaveBeenCalled();
    });

    it('desconta de forma acumulada itens repetidos do mesmo material', async () => {
      // Estoque 12: o primeiro item de 8 passa (sobram 4),
      // o segundo de 8 deve ser rejeitado.
      await expect(
        service.create(
          {
            operacao: 'S',
            motivo: 'Uso na produção',
            itens: [
              { material_id: 7, quantidade: 8 },
              { material_id: 7, quantidade: 8 },
            ],
          },
          1,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(materialQueryBuilder.where).toHaveBeenCalledWith(
        'material.id IN (:...ids)',
        { ids: [7] },
      );

      expect(materialRepository.save).not.toHaveBeenCalled();
    });

    it('recusa material inexistente', async () => {
      materialQueryBuilder.getMany.mockResolvedValue([]);

      await expect(service.create(saida, 1)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(materialRepository.save).not.toHaveBeenCalled();
    });

    it('recusa material inativo', async () => {
      materialQueryBuilder.getMany.mockResolvedValue([
        { ...materialMock, ativo: false } as Material,
      ]);

      await expect(service.create(saida, 1)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(materialRepository.save).not.toHaveBeenCalled();
    });
  });
});