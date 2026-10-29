import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';

export interface FiltrosMovimentacao {
  material_id?: number;
  operacao?: 'E' | 'S';
  dataInicio?: string;
  dataFim?: string;
}

export interface ItemMovimentoResponse {
  material_id: number;
  quantidade: number;
}

export interface MovimentacaoResponse {
  id: number;
  data: string;
  operacao: 'E' | 'S';
  motivo: string;
  itens: ItemMovimentoResponse[];
  is_estornado: boolean;
  motivo_estorno: string | null;
}

export interface CreateMovimentacaoRequest {
  operacao: 'E' | 'S';
  motivo: string;
  itens: {
    material_id: number;
    quantidade: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class MovimentacaoService {
  private url = `${environment.api_url}/movimentacoes`;

  private http: HttpClient = inject(HttpClient);

  public create(movimentacao: CreateMovimentacaoRequest): Observable<MovimentacaoResponse> {
    return this.http.post<MovimentacaoResponse>(this.url, movimentacao);
  }

  public listAll(filtros?: FiltrosMovimentacao): Observable<MovimentacaoResponse[]> {
    let params = new HttpParams();
    if (filtros?.material_id) params = params.set('material_id', filtros.material_id);
    if (filtros?.operacao) params = params.set('operacao', filtros.operacao);
    if (filtros?.dataInicio) params = params.set('dataInicio', filtros.dataInicio);
    if (filtros?.dataFim) params = params.set('dataFim', filtros.dataFim);
    return this.http.get<MovimentacaoResponse[]>(this.url, { params });
  }

  public estornar(id: number, motivo_estorno: string): Observable<MovimentacaoResponse> {
    return this.http.patch<MovimentacaoResponse>(`${this.url}/${id}/estorno`, {
      motivo_estorno,
    });
  }
}
