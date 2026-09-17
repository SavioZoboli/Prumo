import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../pages/movimentacoes/cadastro-movimentacao/cadastro-movimentacao';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {

  private url:string = `${environment.api_url}/materiais`

  private http:HttpClient = inject(HttpClient);

  public listAll():Observable<Material[]>{
    return this.http.get<Material[]>(this.url)
  }

}
