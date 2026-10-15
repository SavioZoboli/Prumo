/**
 * Regras de negócio do dashboard que não dependem do banco.
 * Ficam isoladas aqui para serem testadas sem mock de query.
 */


export const FUSO_HORARIO = 'America/Sao_Paulo';

export const MARGEM_ATENCAO = 0.2;

export type StatusEstoque = 'ABAIXO_MINIMO' | 'EM_ATENCAO' | 'OK';


export function classificarEstoque(
  estoqueAtual: number,
  estoqueMinimo: number,
): StatusEstoque {
  if (estoqueAtual <= estoqueMinimo) return 'ABAIXO_MINIMO';
  if (estoqueAtual <= estoqueMinimo * (1 + MARGEM_ATENCAO)) return 'EM_ATENCAO';
  return 'OK';
}

export type StatusFalta = 'SEM_ESTOQUE' | 'ABAIXO_MINIMO';

export function classificarFalta(estoqueAtual: number): StatusFalta {
  return estoqueAtual <= 0 ? 'SEM_ESTOQUE' : 'ABAIXO_MINIMO';
}

export type StatusCritico = Exclude<StatusEstoque, 'OK'>;


export interface FaixaCritica {
  ate: number;
  acimaDoMinimo: boolean;
}

export function faixaDoStatus(status?: StatusCritico): FaixaCritica {
  if (status === 'ABAIXO_MINIMO') return { ate: 1, acimaDoMinimo: false };
  if (status === 'EM_ATENCAO') {
    return { ate: 1 + MARGEM_ATENCAO, acimaDoMinimo: true };
  }
  return { ate: 1 + MARGEM_ATENCAO, acimaDoMinimo: false };
}

export function hojeNoFuso(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO_HORARIO }).format(
    agora,
  );
}

export function mesAtualNoFuso(agora: Date = new Date()): string {
  return hojeNoFuso(agora).slice(0, 7);
}

function paraData(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function paraIso(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function somarDias(iso: string, dias: number): string {
  const data = paraData(iso);
  data.setUTCDate(data.getUTCDate() + dias);
  return paraIso(data);
}

export function inicioDaSemana(iso: string): string {
  const diaDaSemana = paraData(iso).getUTCDay(); // 0 = domingo
  const diasDesdeSegunda = (diaDaSemana + 6) % 7;
  return somarDias(iso, -diasDesdeSegunda);
}

export interface Semana {
  inicio: string;
  fim: string;
}

export function semanasAte(
  dataReferencia: string,
  quantidade: number,
): Semana[] {
  const ultimaSegunda = inicioDaSemana(dataReferencia);
  return Array.from({ length: quantidade }, (_, i) => {
    const inicio = somarDias(ultimaSegunda, -7 * (quantidade - 1 - i));
    return { inicio, fim: somarDias(inicio, 6) };
  });
}

export function inicioDoMesSeguinte(mes: string): string {
  const [ano, numeroMes] = mes.split('-').map(Number);
  return paraIso(new Date(Date.UTC(ano, numeroMes, 1)));
}
