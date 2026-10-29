import { Material } from '../../../services/material.service';
import { OrdemCompraItem, OrdemCompraLista } from '../cadastro-ordem-compra/cadastro-ordem-compra';

// Mesma regra do dashboard (api/src/dashboard/dashboard.regras.ts):
// até o mínimo = abaixo; até 20% acima do mínimo = em atenção.
export const MARGEM_ATENCAO = 0.2;

export type StatusSugestao = 'ABAIXO_MINIMO' | 'EM_ATENCAO';

export interface SugestaoCompra {
  material: Material;
  status: StatusSugestao;
  quantidadeSugerida: number;
}

export function classificar(material: Material): StatusSugestao | null {
  const { estoqueAtual, estoqueMinimo } = material;
  if (estoqueAtual <= estoqueMinimo) return 'ABAIXO_MINIMO';
  if (estoqueAtual <= estoqueMinimo * (1 + MARGEM_ATENCAO)) return 'EM_ATENCAO';
  return null;
}

// Repõe até o dobro do estoque mínimo, com pelo menos 1 unidade.
export function quantidadeSugerida(material: Material): number {
  return Math.max(1, Math.ceil(material.estoqueMinimo * 2 - material.estoqueAtual));
}

export function montarSugestoes(
  materiais: Material[],
  ordens: OrdemCompraLista[],
): SugestaoCompra[] {
  // Material que já está numa ordem ainda não recebida já está sendo reposto.
  const emOrdemAberta = new Set<number>(
    ordens.filter((o) => o.status !== 'FECHADO').flatMap((o) => o.itens.map((i) => i.id)),
  );

  return (
    materiais
      // Sem estoque mínimo definido não há o que repor.
      .filter((m) => m.ativo && m.estoqueMinimo > 0 && !emOrdemAberta.has(m.id))
      .map((material) => ({ material, status: classificar(material) }))
      .filter((s): s is { material: Material; status: StatusSugestao } => s.status !== null)
      .map(({ material, status }) => ({
        material,
        status,
        quantidadeSugerida: quantidadeSugerida(material),
      }))
      // Abaixo do mínimo primeiro; dentro do grupo, o mais crítico (menor % do mínimo) antes.
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'ABAIXO_MINIMO' ? -1 : 1;
        return (
          a.material.estoqueAtual / a.material.estoqueMinimo -
          b.material.estoqueAtual / b.material.estoqueMinimo
        );
      })
  );
}

// Converte as sugestões escolhidas nos itens que o formulário da ordem já entende.
export function paraItensDaOrdem(sugestoes: SugestaoCompra[]): OrdemCompraItem[] {
  return sugestoes.map(({ material, quantidadeSugerida }) => ({
    ...material,
    quantidade: quantidadeSugerida,
    valor: Number(material.ultimoValor ?? 0),
  }));
}
