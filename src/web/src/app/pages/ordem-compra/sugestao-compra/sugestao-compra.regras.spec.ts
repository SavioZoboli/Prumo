import { Material } from '../../../services/material.service';
import { OrdemCompraLista } from '../cadastro-ordem-compra/cadastro-ordem-compra';
import {
  classificar,
  montarSugestoes,
  paraItensDaOrdem,
  quantidadeSugerida,
} from './sugestao-compra.regras';

function material(id: number, estoqueAtual: number, estoqueMinimo: number, extra: Partial<Material> = {}): Material {
  return {
    id,
    nome: `Material ${id}`,
    codigo: `M-${id}`,
    equipamento: 'Torno CNC',
    estoqueAtual,
    estoqueMinimo,
    fabricanteId: 1,
    ativo: true,
    ultimoValor: 10,
    unidadeMedida: 'UN',
    localizacao: null,
    ...extra,
  };
}

function ordem(
  id: number,
  status: OrdemCompraLista['status'],
  materiais: Material[],
  quantidade = 1,
): OrdemCompraLista {
  return {
    id,
    status,
    fornecedor: { id: 1, nome: 'Fornecedor', cnpj: '', ativo: true } as OrdemCompraLista['fornecedor'],
    dt_emissao: new Date(),
    dt_entrega: null,
    dt_entrega_prevista: null,
    valor_total: 0,
    itens: materiais.map((m) => ({ ...m, quantidade, valor: 1 })),
  };
}

describe('sugestão de compra — regras', () => {
  it('classifica igual ao dashboard: até o mínimo é abaixo, até 20% acima é atenção', () => {
    expect(classificar(material(1, 10, 10))).toBe('ABAIXO_MINIMO');
    expect(classificar(material(1, 3, 10))).toBe('ABAIXO_MINIMO');
    expect(classificar(material(1, 12, 10))).toBe('EM_ATENCAO');
    expect(classificar(material(1, 13, 10))).toBeNull();
  });

  it('sugere repor até o dobro do mínimo, com pelo menos 1 unidade', () => {
    expect(quantidadeSugerida(material(1, 3, 10))).toBe(17);
    expect(quantidadeSugerida(material(1, 12, 10))).toBe(8);
    expect(quantidadeSugerida(material(1, 0, 0.4))).toBe(1);
  });

  it('desconta da quantidade sugerida o que já está em ordem', () => {
    expect(quantidadeSugerida(material(1, 3, 10), 5)).toBe(12);
    expect(quantidadeSugerida(material(1, 3, 10), 50)).toBe(1);
  });

  it('ignora inativos, materiais sem mínimo e os que estão normais', () => {
    const { sugestoes } = montarSugestoes(
      [
        material(1, 2, 10, { ativo: false }),
        material(2, 0, 0),
        material(3, 50, 10),
        material(4, 5, 10),
      ],
      [],
    );

    expect(sugestoes.map((s) => s.material.id)).toEqual([4]);
  });

  it('lista abaixo do mínimo antes de em atenção, do mais crítico para o menos', () => {
    const { sugestoes } = montarSugestoes(
      [material(1, 11, 10), material(2, 8, 10), material(3, 2, 10)],
      [],
    );

    expect(sugestoes.map((s) => s.material.id)).toEqual([3, 2, 1]);
  });

  it('tira da sugestão o material que as ordens não recebidas já repõem', () => {
    const m1 = material(1, 2, 10);
    const m2 = material(2, 2, 10);
    const m3 = material(3, 2, 10);

    const { sugestoes, cobertosPorOrdem } = montarSugestoes(
      [m1, m2, m3],
      [ordem(7, 'ABERTO', [m1], 20), ordem(8, 'EM ATRASO', [m2], 20), ordem(9, 'FECHADO', [m3], 20)],
    );

    // Ordem já recebida não conta como reposição pendente.
    expect(sugestoes.map((s) => s.material.id)).toEqual([3]);
    expect(cobertosPorOrdem.map((c) => c.material.id)).toEqual([1, 2]);
    expect(cobertosPorOrdem[0].quantidadeEmOrdem).toBe(20);
  });

  it('mantém na sugestão o material cuja ordem aberta não basta para sair do mínimo', () => {
    // Caso de prod: 10 em estoque, mínimo 100, 90 pedidos -> chega a 100, ainda no mínimo.
    const m = material(1, 10, 100);

    const { sugestoes, cobertosPorOrdem } = montarSugestoes([m], [ordem(7, 'ABERTO', [m], 90)]);

    expect(sugestoes).toHaveLength(1);
    expect(sugestoes[0].status).toBe('ABAIXO_MINIMO');
    expect(sugestoes[0].quantidadeEmOrdem).toBe(90);
    expect(sugestoes[0].quantidadeSugerida).toBe(100);
    expect(cobertosPorOrdem).toEqual([]);
  });

  it('soma o que está pedido em mais de uma ordem aberta', () => {
    const m = material(1, 0, 10);

    const { sugestoes, cobertosPorOrdem } = montarSugestoes(
      [m],
      [ordem(7, 'ABERTO', [m], 6), ordem(8, 'EM ATRASO', [m], 6)],
    );

    // 0 + 12 = 12, ainda dentro dos 20% acima do mínimo.
    expect(sugestoes[0].status).toBe('EM_ATENCAO');
    expect(sugestoes[0].quantidadeEmOrdem).toBe(12);
    expect(sugestoes[0].quantidadeSugerida).toBe(8);
    expect(cobertosPorOrdem).toEqual([]);
  });

  it('converte as sugestões em itens da ordem com a quantidade sugerida e o último valor', () => {
    const [item] = paraItensDaOrdem(
      montarSugestoes([material(1, 3, 10, { ultimoValor: 25.9 })], []).sugestoes,
    );

    expect(item.id).toBe(1);
    expect(item.quantidade).toBe(17);
    expect(item.valor).toBe(25.9);
  });
});
