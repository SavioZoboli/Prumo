import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';

export type StatusEstoque = 'ABAIXO_MINIMO' | 'EM_ATENCAO';
export type StatusFalta = 'SEM_ESTOQUE' | 'ABAIXO_MINIMO';

export interface ResumoDashboard {
  itensAbaixoMinimo: number;
  itensEmAtencao: number;
  ordensCompraPendentes: number;
  ordensCompraAtrasadas: number;
}

export interface ItemCritico {
  id: number;
  codigo: string;
  nome: string;
  unidadeMedida: string | null;
  estoqueAtual: number;
  estoqueMinimo: number;
  status: StatusEstoque;
}

export interface MaterialEmFalta {
  id: number;
  codigo: string;
  nome: string;
  status: StatusFalta;
}

export interface Paginado<T> {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
}

export interface UltimaMovimentacao {
  movimentacaoId: number;
  data: string;
  operacao: 'E' | 'S';
  materialId: number;
  material: string;
  quantidade: number;
  usuario: string;
  ordemProducao: string | null;
  estornado: boolean;
}

export interface MovimentacaoSemanal {
  inicio: string;
  fim: string;
  entradas: number;
  saidas: number;
}

export interface MaterialConsumido {
  materialId: number;
  codigo: string;
  nome: string;
  unidadeMedida: string | null;
  quantidade: number;
}

export interface FiltroPaginado {
  busca?: string;
  pagina?: number;
  limite?: number;
  status?: StatusEstoque;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private url = `${environment.api_url}/dashboard`;

  private http: HttpClient = inject(HttpClient);

  public resumo(): Observable<ResumoDashboard> {
    return this.http.get<ResumoDashboard>(`${this.url}/resumo`);
  }

  public itensCriticos(filtro: FiltroPaginado = {}): Observable<Paginado<ItemCritico>> {
    return this.http.get<Paginado<ItemCritico>>(`${this.url}/itens-criticos`, {
      params: this.params({ ...filtro }),
    });
  }

  public materiaisEmFalta(
    filtro: Omit<FiltroPaginado, 'status'> = {},
  ): Observable<Paginado<MaterialEmFalta>> {
    return this.http.get<Paginado<MaterialEmFalta>>(`${this.url}/materiais-em-falta`, {
      params: this.params({ ...filtro }),
    });
  }

  public ultimasMovimentacoes(limite = 5): Observable<UltimaMovimentacao[]> {
    return this.http.get<UltimaMovimentacao[]>(`${this.url}/ultimas-movimentacoes`, {
      params: this.params({ limite }),
    });
  }

  public movimentacoesSemanais(
    semanas = 6,
    dataReferencia?: string,
  ): Observable<MovimentacaoSemanal[]> {
    return this.http.get<MovimentacaoSemanal[]>(`${this.url}/movimentacoes-semanais`, {
      params: this.params({ semanas, dataReferencia }),
    });
  }

  public materiaisMaisConsumidos(limite = 5, mes?: string): Observable<MaterialConsumido[]> {
    return this.http.get<MaterialConsumido[]>(`${this.url}/materiais-mais-consumidos`, {
      params: this.params({ limite, mes }),
    });
  }

  private params(valores: Record<string, string | number | undefined>): HttpParams {
    let params = new HttpParams();
    for (const [chave, valor] of Object.entries(valores)) {
      if (valor !== undefined && valor !== '') params = params.set(chave, valor);
    }
    return params;
  }
}

