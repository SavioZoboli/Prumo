import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuarios } from '../pages/usuarios/usuarios';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private url:string = `${environment.api_url}/usuarios`

  private http:HttpClient = inject(HttpClient);

  public create(
    nome:string,
    sobrenome:string,
    email:string,
    senha:string,
    perfil:string
  ):Observable<number>{
    return this.http.post<number>(this.url,{
      nome,
      sobrenome,
      email,
      senha,
      perfil,
      ativo:true
    })
  }

  public update(
    id:number,
    nome:string,
    sobrenome:string,
    email:string,
    ativo:boolean,
    perfil:string
  ):Observable<void>{
    return this.http.patch<void>(`${this.url}/${id}`,{
      nome,
      sobrenome,
      email,
      ativo,
      perfil
    })
  }

  public listAll():Observable<any>{
    return this.http.get<any>(this.url)
  }

  public desativar(id:number):Observable<void>{
    return this.http.delete<any>(`${this.url}/${id}`)
  }


}
