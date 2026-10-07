import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

export interface IOrdemCompraItem{
  material_id:number,
  quantidade:number,
  valor:number
}

@Injectable({
  providedIn: 'root',
})
export class OrdemCompraService {
  private http = inject(HttpClient)
  private url = `${environment.api_url}/ordens-compra`

  public findAll():Observable<any>{
    return this.http.get(this.url)
  }

  public salvar(fornecedor_id:number, dt_entrega_prevista:Date, itens:IOrdemCompraItem[]):Observable<number>{
    return this.http.post<number>(this.url,{fornecedor_id,dt_entrega_prevista,itens})
  }

  public atualizar(id:number,dt_entrega_prevista:Date,itens:IOrdemCompraItem[]):Observable<void>{
    return this.http.put<void>(`${this.url}/${id}`,{dt_entrega_prevista,itens})
  }

  public receber(id: number):Observable<void>{
  return this.http.patch<void>(`${this.url}/${id}/receber`, {});
}
}
