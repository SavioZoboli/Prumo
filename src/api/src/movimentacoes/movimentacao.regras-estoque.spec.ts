import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOperator } from 'typeorm';
import { MovimentacaoService } from './movimentacao.service';
import { Movimentacao } from './movimentacao.entity';
import { ItemMovimento } from './item-movimento.entity';
import { Material } from '../materiais/material.entity';
import { AlertaEstoqueService } from '../alertas/alerta-estoque.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

// Banco em memória: cada teste confere o estoque que sobra, e não só as chamadas.
describe('MovimentacaoService — regras de estoque', () => {
  let service: MovimentacaoService;
  let materiais: Map<number, Material>;
  let movimentacoes: Map<number, Movimentacao>;
  let itensMovimento: ItemMovimento[];

  const alertaEstoqueService = {
    verificarMateriais: jest.fn<(ids: number[]) => Promise<void>>(),
  };

  const materialRepository = {
    findOne: jest.fn(({ where }: { where: { id: number } }) =>
      Promise.resolve(materiais.get(where.id) ?? null),
    ),
    save: jest.fn((lista: Material[]) => Promise.resolve(lista)),
  };

  const manager = {
    getRepository: jest.fn(() => materialRepository),
    create: jest.fn((_entidade: unknown, dados: object) => dados),
    save: jest.fn((entidadeOuDados: unknown, dados?: unknown) =>
      Promise.resolve(dados ?? { ...(entidadeOuDados as object), id: 50 }),
    ),
    findOne: jest.fn(
      (_entidade: unknown, { where }: { where: { id: number } }) =>
        Promise.resolve(movimentacoes.get(where.id) ?? null),
    ),
    find: jest.fn(
      (entidade: unknown, { where }: { where: Record<string, unknown> }) => {
        if (entidade === ItemMovimento) {
          return Promise.resolve(
            itensMovimento.filter((i) => i.movimento_id === where.movimento_id),
          );
        }
        const ids = (where.id as FindOperator<number[]>).value;
        return Promise.resolve(ids.flatMap((id) => materiais.get(id) ?? []));
      },
    ),
    update: jest.fn(
      (_entidade: unknown, id: number, dados: Partial<Movimentacao>) => {
        Object.assign(movimentacoes.get(id)!, dados);
        return Promise.resolve();
      },
    ),
  };

  const movimentacaoRepository = {
    manager: {
      transaction: (callback: (m: typeof manager) => Promise<unknown>) =>
        callback(manager),
    },
    findOne: jest.fn(({ where }: { where: { id: number } }) =>
      Promise.resolve(movimentacoes.get(where.id) ?? null),
    ),
  };

  const material = (id: number, estoqueAtual: number, ativo = true) =>
    ({ id, estoqueAtual, estoqueMinimo: 0, ativo }) as Material;

  const estoqueDe = (id: number) => materiais.get(id)!.estoqueAtual;

  beforeEach(async () => {
    jest.clearAllMocks();
    alertaEstoqueService.verificarMateriais.mockResolvedValue(undefined);

    materiais = new Map([
      [1, material(1, 5)],
      [2, material(2, 20)],
      [3, material(3, 10, false)],
    ]);
    movimentacoes = new Map();
    itensMovimento = [];

    const modulo = await Test.createTestingModule({
      providers: [
        MovimentacaoService,
        {
          provide: getRepositoryToken(Movimentacao),
          useValue: movimentacaoRepository,
        },
        { provide: getRepositoryToken(Material), useValue: {} },
        { provide: AlertaEstoqueService, useValue: alertaEstoqueService },
      ],
    }).compile();

    service = modulo.get(MovimentacaoService);
  });

  const movimento = (
    operacao: string,
    itens: CreateMovimentacaoDto['itens'],
  ): CreateMovimentacaoDto => ({ operacao, motivo: 'Teste', itens });

  describe('registro de movimentação', () => {
    it('entrada soma a quantidade ao estoque', async () => {
      await service.create(
        movimento('E', [{ material_id: 1, quantidade: 10 }]),
        1,
      );

      expect(estoqueDe(1)).toBe(15);
    });

    it('saída subtrai a quantidade do estoque', async () => {
      await service.create(
        movimento('S', [{ material_id: 1, quantidade: 3 }]),
        1,
      );

      expect(estoqueDe(1)).toBe(2);
    });

    it('permite retirar exatamente todo o estoque', async () => {
      await service.create(
        movimento('S', [{ material_id: 1, quantidade: 5 }]),
        1,
      );

      expect(estoqueDe(1)).toBe(0);
    });

    it('bloqueia saída maior que o estoque disponível', async () => {
      await expect(
        service.create(movimento('S', [{ material_id: 1, quantidade: 6 }]), 1),
      ).rejects.toThrow(BadRequestException);

      expect(materialRepository.save).not.toHaveBeenCalled();
    });

    it('soma as saídas do mesmo material na mesma movimentação', async () => {
      // 3 + 3 passa de 5, mesmo que cada item sozinho caiba no estoque.
      await expect(
        service.create(
          movimento('S', [
            { material_id: 1, quantidade: 3 },
            { material_id: 1, quantidade: 3 },
          ]),
          1,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(materialRepository.save).not.toHaveBeenCalled();
    });

    it('atualiza vários materiais na mesma movimentação', async () => {
      await service.create(
        movimento('S', [
          { material_id: 1, quantidade: 2 },
          { material_id: 2, quantidade: 5 },
        ]),
        1,
      );

      expect(estoqueDe(1)).toBe(3);
      expect(estoqueDe(2)).toBe(15);
    });

    it('bloqueia material inexistente', async () => {
      await expect(
        service.create(movimento('E', [{ material_id: 99, quantidade: 1 }]), 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('bloqueia material inativo', async () => {
      await expect(
        service.create(movimento('E', [{ material_id: 3, quantidade: 1 }]), 1),
      ).rejects.toThrow(BadRequestException);

      expect(estoqueDe(3)).toBe(10);
    });

    it.each([0, -2])('bloqueia quantidade %i', async (quantidade) => {
      await expect(
        service.create(movimento('E', [{ material_id: 1, quantidade }]), 1),
      ).rejects.toThrow(BadRequestException);

      expect(estoqueDe(1)).toBe(5);
    });

    it('bloqueia operação diferente de entrada ou saída', async () => {
      await expect(
        service.create(movimento('X', [{ material_id: 1, quantidade: 1 }]), 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('registra quem fez a movimentação, sem marcar como estornada', async () => {
      const salva = await service.create(
        movimento('E', [{ material_id: 1, quantidade: 1 }]),
        42,
      );

      expect(salva).toMatchObject({ usuario_id: 42, is_estornado: false });
      expect(salva.itens).toEqual([
        expect.objectContaining({ material_id: 1, quantidade: 1 }),
      ]);
    });
  });

  describe('estorno de movimentação', () => {
    const registrar = (id: number, operacao: string, quantidade: number) => {
      movimentacoes.set(id, {
        id,
        operacao,
        is_estornado: false,
        motivo_estorno: null,
      } as Movimentacao);
      itensMovimento.push({
        movimento_id: id,
        material_id: 2,
        quantidade,
      } as ItemMovimento);
    };

    it('estorno de entrada tira a quantidade do estoque', async () => {
      registrar(10, 'E', 8);

      await service.estornar(10, 'Lançamento duplicado');

      expect(estoqueDe(2)).toBe(12);
    });

    it('estorno de saída devolve a quantidade ao estoque', async () => {
      registrar(10, 'S', 4);

      await service.estornar(10, 'Retirada cancelada');

      expect(estoqueDe(2)).toBe(24);
    });

    it('marca a movimentação como estornada e guarda o motivo', async () => {
      registrar(10, 'S', 4);

      await service.estornar(10, 'Retirada cancelada');

      expect(movimentacoes.get(10)).toMatchObject({
        is_estornado: true,
        motivo_estorno: 'Retirada cancelada',
      });
    });

    it('não estorna duas vezes a mesma movimentação', async () => {
      registrar(10, 'S', 4);
      await service.estornar(10, 'Primeiro estorno');

      await expect(service.estornar(10, 'Segundo estorno')).rejects.toThrow(
        BadRequestException,
      );
      expect(estoqueDe(2)).toBe(24);
    });

    it('bloqueia movimentação inexistente', async () => {
      await expect(service.estornar(999, 'Motivo')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('bloqueia estorno de entrada quando o material já foi consumido', async () => {
      // Entraram 30, mas só restam 20: desfazer a entrada deixaria o estoque negativo.
      registrar(10, 'E', 30);

      await expect(service.estornar(10, 'Motivo')).rejects.toThrow(
        BadRequestException,
      );
      expect(estoqueDe(2)).toBe(20);
      expect(movimentacoes.get(10)!.is_estornado).toBe(false);
    });

    it('verifica o alerta de estoque dos materiais estornados', async () => {
      registrar(10, 'S', 4);

      await service.estornar(10, 'Motivo');

      expect(alertaEstoqueService.verificarMateriais).toHaveBeenCalledWith([2]);
    });
  });
});
