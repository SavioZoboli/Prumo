import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';

export interface Material {
  id: number;
  nome: string;
  codigo: string;
  equipamento: string;
  estoqueMinimo: number;
  estoqueAtual: number;
  fabricanteId: number;
  ativo: boolean;
  ultimoValor: number | null;
  unidadeMedida: string | null;
  localizacao: string | null;
}

export interface MaterialRequest {
  nome: string;
  codigo: string;
  equipamento: string;
  estoqueMinimo: number;
  fabricanteId: number;
  ativo?: boolean;
  ultimoValor?: number | null;
  unidadeMedida?: string;
  localizacao?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private url = `${environment.api_url}/materiais`;

  private http: HttpClient = inject(HttpClient);

  public create(material: MaterialRequest): Observable<Material> {
    return this.http.post<Material>(this.url, material);
  }

  public update(
    id: number,
    material: Partial<MaterialRequest>
  ): Observable<Material> {
    return this.http.patch<Material>(
      `${this.url}/${id}`,
      material
    );
  }

  public listAll(): Observable<Material[]> {
    return this.http.get<Material[]>(this.url);
  }

  public desativar(id: number): Observable<Material> {
    return this.http.delete<Material>(
      `${this.url}/${id}`
    );
  }
}