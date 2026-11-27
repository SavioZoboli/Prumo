import { Material } from '../../../services/material.service';
import { OrdemCompraItem, OrdemCompraLista } from '../cadastro-ordem-compra/cadastro-ordem-compra';

// Mesma regra do dashboard (api/src/dashboard/dashboard.regras.ts):
// até o mínimo = abaixo; até 20% acima do mínimo = em atenção.
export const MARGEM_ATENCAO = 0.2;

export type StatusSugestao = 'ABAIXO_MINIMO' | 'EM_ATENCAO';

export interface SugestaoCompra {
  material: Material;
  status: StatusSugestao;
  // Quantidade já pedida em ordens ainda não recebidas.
  quantidadeEmOrdem: number;
  quantidadeSugerida: number;
}

// Material abaixo do mínimo ou em atenção pelo estoque atual, mas que as
// ordens não recebidas já repõem — por isso não entra na sugestão.
export interface CobertoPorOrdem {
  material: Material;
  quantidadeEmOrdem: number;
}

export interface ResultadoSugestao {
  sugestoes: SugestaoCompra[];
  cobertosPorOrdem: CobertoPorOrdem[];
}

export function classificarEstoque(estoque: number, estoqueMinimo: number): StatusSugestao | null {
  if (estoque <= estoqueMinimo) return 'ABAIXO_MINIMO';
  if (estoque <= estoqueMinimo * (1 + MARGEM_ATENCAO)) return 'EM_ATENCAO';
  return null;
}

export function classificar(material: Material): StatusSugestao | null {
  return classificarEstoque(material.estoqueAtual, material.estoqueMinimo);
}

// Repõe até o dobro do estoque mínimo, descontando o que já foi pedido, com pelo menos 1 unidade.
export function quantidadeSugerida(material: Material, quantidadeEmOrdem = 0): number {
  return Math.max(
    1,
    Math.ceil(material.estoqueMinimo * 2 - material.estoqueAtual - quantidadeEmOrdem),
  );
}

// Soma, por material, o que está pedido em ordens ainda não recebidas.
export function quantidadesEmOrdemAberta(ordens: OrdemCompraLista[]): Map<number, number> {
  const pendente = new Map<number, number>();
  ordens
    .filter((o) => o.status !== 'FECHADO')
    .flatMap((o) => o.itens)
    .forEach((item) => {
      pendente.set(item.id, (pendente.get(item.id) ?? 0) + Number(item.quantidade ?? 0));
    });
  return pendente;
}

export function montarSugestoes(
  materiais: Material[],
  ordens: OrdemCompraLista[],
): ResultadoSugestao {
  const pendente = quantidadesEmOrdemAberta(ordens);
  const sugestoes: SugestaoCompra[] = [];
  const cobertosPorOrdem: CobertoPorOrdem[] = [];

  materiais
    // Sem estoque mínimo definido não há o que repor.
    .filter((m) => m.ativo && m.estoqueMinimo > 0)
    .forEach((material) => {
      const quantidadeEmOrdem = pendente.get(material.id) ?? 0;
      // Classifica pelo estoque que existirá quando as ordens abertas chegarem.
      const status = classificarEstoque(
        material.estoqueAtual + quantidadeEmOrdem,
        material.estoqueMinimo,
      );

      if (status) {
        sugestoes.push({
          material,
          status,
          quantidadeEmOrdem,
          quantidadeSugerida: quantidadeSugerida(material, quantidadeEmOrdem),
        });
      } else if (quantidadeEmOrdem > 0 && classificar(material)) {
        cobertosPorOrdem.push({ material, quantidadeEmOrdem });
      }
    });

  // Abaixo do mínimo primeiro; dentro do grupo, o mais crítico (menor % do mínimo) antes.
  const projecao = (s: SugestaoCompra) =>
    (s.material.estoqueAtual + s.quantidadeEmOrdem) / s.material.estoqueMinimo;
  sugestoes.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'ABAIXO_MINIMO' ? -1 : 1;
    return projecao(a) - projecao(b);
  });

  return { sugestoes, cobertosPorOrdem };
}

// Converte as sugestões escolhidas nos itens que o formulário da ordem já entende.
export function paraItensDaOrdem(sugestoes: SugestaoCompra[]): OrdemCompraItem[] {
  return sugestoes.map(({ material, quantidadeSugerida }) => ({
    ...material,
    quantidade: quantidadeSugerida,
    valor: Number(material.ultimoValor ?? 0),
  }));
}
