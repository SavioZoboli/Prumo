import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOperator } from 'typeorm';
import { MovimentacaoService } from './movimentacao.service';
import { Movimentacao } from './movimentacao.entity';
import { ItemMovimento } from './item-movimento.entity';
import { Material } from '../materiais/material.entity';
import { OrdemCompra } from '../ordem-compra/ordem-compra.entity';
import { AlertaEstoqueService } from '../alertas/alerta-estoque.service';

// Bug 09: estornar a entrada de uma ordem recebida deixava a ordem travada como "Recebida".
describe('MovimentacaoService — estorno da entrada de ordem de compra', () => {
  let service: MovimentacaoService;
  let materiais: Map<number, Material>;
  let movimentacoes: Map<number, Movimentacao>;
  let itensMovimento: ItemMovimento[];
  let ordens: Map<number, OrdemCompra>;

  const manager = {
    findOne: jest.fn(
      (
        entidade: unknown,
        { where }: { where: { id: number }; lock?: object },
      ) =>
        Promise.resolve(
          (entidade === OrdemCompra
            ? ordens.get(where.id)
            : movimentacoes.get(where.id)) ?? null,
        ),
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
    save: jest.fn((lista: unknown) => Promise.resolve(lista)),
    count: jest.fn(
      (_entidade: unknown, { where }: { where: Partial<Movimentacao> }) =>
        Promise.resolve(
          [...movimentacoes.values()].filter(
            (m) =>
              m.ordem_compra_id === where.ordem_compra_id &&
              m.operacao === where.operacao &&
              m.is_estornado === where.is_estornado,
          ).length,
        ),
    ),
    update: jest.fn((entidade: unknown, id: number, dados: object) => {
      const alvo =
        entidade === OrdemCompra ? ordens.get(id) : movimentacoes.get(id);
      Object.assign(alvo!, dados);
      return Promise.resolve();
    }),
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

  const registrar = (
    id: number,
    operacao: string,
    ordemCompraId: number | null,
  ) => {
    movimentacoes.set(id, {
      id,
      operacao,
      ordem_compra_id: ordemCompraId,
      is_estornado: false,
      motivo_estorno: null,
    } as Movimentacao);
    itensMovimento.push({
      movimento_id: id,
      material_id: 1,
      quantidade: 5,
    } as ItemMovimento);
  };

  const dtEntregaDa = (id: number) => ordens.get(id)!.dt_entrega;

  beforeEach(async () => {
    jest.clearAllMocks();

    materiais = new Map([
      [1, { id: 1, nome: 'Pastilha 1', estoqueAtual: 50 } as Material],
    ]);
    movimentacoes = new Map();
    itensMovimento = [];
    ordens = new Map([
      [7, { id: 7, dt_entrega: new Date('2026-11-01') } as OrdemCompra],
    ]);

    const modulo = await Test.createTestingModule({
      providers: [
        MovimentacaoService,
        {
          provide: getRepositoryToken(Movimentacao),
          useValue: movimentacaoRepository,
        },
        { provide: getRepositoryToken(Material), useValue: {} },
        {
          provide: AlertaEstoqueService,
          useValue: { verificarMateriais: jest.fn() },
        },
      ],
    }).compile();

    service = modulo.get(MovimentacaoService);
  });

  it('reabre a ordem de compra ao estornar a entrada do recebimento', async () => {
    registrar(10, 'E', 7);

    await service.estornar(10, 'Recebimento lançado errado');

    expect(dtEntregaDa(7)).toBeNull();
    expect(materiais.get(1)!.estoqueAtual).toBe(45);
  });

  it('trava a ordem antes dos materiais, para estornos simultâneos não se atropelarem', async () => {
    registrar(10, 'E', 7);

    await service.estornar(10, 'Recebimento lançado errado');

    const travaOrdem = manager.findOne.mock.invocationCallOrder.find(
      (_ordem, i) => manager.findOne.mock.calls[i][0] === OrdemCompra,
    );
    const travaMateriais = manager.find.mock.invocationCallOrder.find(
      (_ordem, i) => manager.find.mock.calls[i][0] === Material,
    );

    expect(manager.findOne).toHaveBeenCalledWith(OrdemCompra, {
      where: { id: 7 },
      lock: { mode: 'pessimistic_write' },
    });
    expect(travaOrdem!).toBeLessThan(travaMateriais!);
  });

  it('mantém a ordem recebida se ainda houver outra entrada ativa ligada a ela', async () => {
    registrar(10, 'E', 7);
    registrar(11, 'E', 7);

    await service.estornar(10, 'Entrada duplicada');

    expect(dtEntregaDa(7)).toBeInstanceOf(Date);
  });

  it('não mexe em ordem de compra ao estornar entrada sem ordem vinculada', async () => {
    registrar(10, 'E', null);

    await service.estornar(10, 'Lançamento manual');

    expect(dtEntregaDa(7)).toBeInstanceOf(Date);
    expect(manager.update).not.toHaveBeenCalledWith(
      OrdemCompra,
      expect.anything(),
      expect.anything(),
    );
  });

  it('não reabre a ordem ao estornar uma saída', async () => {
    registrar(10, 'S', 7);

    await service.estornar(10, 'Retirada cancelada');

    expect(dtEntregaDa(7)).toBeInstanceOf(Date);
    expect(manager.findOne).not.toHaveBeenCalledWith(
      OrdemCompra,
      expect.anything(),
    );
  });
});
