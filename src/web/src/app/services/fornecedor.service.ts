import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Fornecedor{
  id?:number;
  nome:string;
  cnpj:string;
  ativo:boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FornecedorService {
  
  private http = inject(HttpClient)

  private url = `${environment.api_url}/fornecedores`

  listAll():Observable<Fornecedor[]>{
    return this.http.get<Fornecedor[]>(this.url)
  }

  save(nome:string,cnpj:string):Observable<void>{
    return this.http.post<void>(this.url,{nome,cnpj})
  }

  findOne(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.url}/${id}`);
  }

  update(
    id: number,
    fornecedor: Partial<Fornecedor>
  ): Observable<Fornecedor> {
    return this.http.patch<Fornecedor>(
      `${this.url}/${id}`,
      fornecedor
    );
  }

  desativar(id: number): Observable<Fornecedor> {
    return this.http.delete<Fornecedor>(`${this.url}/${id}`);
  }
}
