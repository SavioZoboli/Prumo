import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdemCompraService } from './ordem-compra-servce';
import { OrdemCompra } from './ordem-compra.entity';
import { ItemOrdemCompra } from './itens-ordem-compra.entity';
import { Movimentacao } from '../movimentacoes/movimentacao.entity';
import { ItemMovimento } from '../movimentacoes/item-movimento.entity';
import { CreateOrdemCompraDto } from './dto/create-ordem-compra.dto';

describe('OrdemCompraService', () => {
  let service: OrdemCompraService;
  let ordens: Map<number, OrdemCompra>;
  let itensOrdem: ItemOrdemCompra[];
  let estoque: Map<number, number>;
  let salvos: { entidade: unknown; dados: unknown }[];

  const manager = {
    findOne: jest.fn(
      (_entidade: unknown, { where }: { where: { id: number } }) =>
        Promise.resolve(ordens.get(where.id) ?? null),
    ),
    find: jest.fn(
      (_entidade: unknown, { where }: { where: { ordem_compra_id: number } }) =>
        Promise.resolve(
          itensOrdem.filter((i) => i.ordem_compra_id === where.ordem_compra_id),
        ),
    ),
    increment: jest.fn(
      (
        _entidade: unknown,
        { id }: { id: number },
        _coluna: string,
        valor: number,
      ) => {
        estoque.set(id, (estoque.get(id) ?? 0) + valor);
        return Promise.resolve();
      },
    ),
    create: jest.fn((entidade: unknown, dados: object) => ({
      entidade,
      ...dados,
    })),
    save: jest.fn((entidadeOuDados: unknown, dados?: unknown) => {
      const registro = dados ?? entidadeOuDados;
      salvos.push({
        entidade: dados ? entidadeOuDados : undefined,
        dados: registro,
      });
      return Promise.resolve(
        Array.isArray(registro)
          ? registro
          : { ...(registro as object), id: 70 },
      );
    }),
    update: jest.fn(
      (_entidade: unknown, id: number, dados: Partial<OrdemCompra>) => {
        Object.assign(ordens.get(id)!, dados);
        return Promise.resolve();
      },
    ),
  };

  const ordemCompraRepository = {
    manager: {
      transaction: (callback: (m: typeof manager) => Promise<unknown>) =>
        callback(manager),
    },
    findOne: jest.fn(({ where }: { where: { id: number } }) =>
      Promise.resolve(ordens.get(where.id) ?? null),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    ordens = new Map([
      [5, { id: 5, dt_entrega: null } as OrdemCompra],
      [6, { id: 6, dt_entrega: new Date('2026-10-01') } as OrdemCompra],
    ]);
    itensOrdem = [
      { ordem_compra_id: 5, material_id: 1, quantidade: 10, valor: 2 },
      { ordem_compra_id: 5, material_id: 2, quantidade: 4, valor: 30 },
    ] as ItemOrdemCompra[];
    estoque = new Map([
      [1, 3],
      [2, 0],
    ]);
    salvos = [];

    const modulo = await Test.createTestingModule({
      providers: [
        OrdemCompraService,
        {
          provide: getRepositoryToken(OrdemCompra),
          useValue: ordemCompraRepository,
        },
      ],
    }).compile();

    service = modulo.get(OrdemCompraService);
  });

  describe('recebimento', () => {
    it('soma ao estoque a quantidade de cada item da ordem', async () => {
      await service.receber(5, 1);

      expect(estoque.get(1)).toBe(13);
      expect(estoque.get(2)).toBe(4);
    });

    it('gera uma movimentação de entrada com os itens recebidos', async () => {
      await service.receber(5, 42);

      const movimentacao = salvos.find(
        (s) => (s.dados as { entidade?: unknown }).entidade === Movimentacao,
      )?.dados;
      const itens = salvos.find((s) => s.entidade === ItemMovimento)?.dados;

      expect(movimentacao).toMatchObject({ operacao: 'E', usuario_id: 42 });
      expect(itens).toEqual([
        expect.objectContaining({
          movimento_id: 70,
          material_id: 1,
          quantidade: 10,
        }),
        expect.objectContaining({
          movimento_id: 70,
          material_id: 2,
          quantidade: 4,
        }),
      ]);
    });

    it('marca a data de entrega', async () => {
      await service.receber(5, 1);

      expect(ordens.get(5)!.dt_entrega).toBeInstanceOf(Date);
    });

    it('não recebe duas vezes a mesma ordem', async () => {
      await expect(service.receber(6, 1)).rejects.toThrow(BadRequestException);

      expect(manager.increment).not.toHaveBeenCalled();
    });

    it('bloqueia ordem inexistente', async () => {
      await expect(service.receber(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('criação', () => {
    const ordem = (
      itens: CreateOrdemCompraDto['itens'],
    ): CreateOrdemCompraDto => ({ fornecedor_id: 1, itens });

    it('calcula o valor total pela soma de quantidade × valor', async () => {
      const criada = await service.create(
        ordem([
          { material_id: 1, quantidade: 10, valor: 2 },
          { material_id: 2, quantidade: 4, valor: 30 },
        ]),
      );

      expect(criada.valor_total).toBe(140);
    });

    it.each([
      ['quantidade zero', { material_id: 1, quantidade: 0, valor: 2 }],
      ['valor zero', { material_id: 1, quantidade: 1, valor: 0 }],
    ])('bloqueia %s', async (_caso, item) => {
      await expect(service.create(ordem([item]))).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('bloqueia o mesmo material repetido na ordem', async () => {
      await expect(
        service.create(
          ordem([
            { material_id: 1, quantidade: 1, valor: 2 },
            { material_id: 1, quantidade: 2, valor: 2 },
          ]),
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
