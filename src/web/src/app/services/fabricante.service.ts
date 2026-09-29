import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';

export interface Fabricante {
  id: number;
  nome: string;
  ativo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FabricanteService {
  private url = `${environment.api_url}/fabricantes`;

  private http: HttpClient = inject(HttpClient);

  public listAll(): Observable<Fabricante[]> {
    return this.http.get<Fabricante[]>(this.url);
  }

  public create(nome: string): Observable<Fabricante> {
    return this.http.post<Fabricante>(this.url, { nome });
  }

  public update(id: number, nome: string): Observable<Fabricante> {
    return this.http.patch<Fabricante>(`${this.url}/${id}`, { nome });
  }

  public desativar(id: number): Observable<Fabricante> {
    return this.http.delete<Fabricante>(`${this.url}/${id}`);
  }
}
