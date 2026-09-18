import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  access_token: string;
}

interface TokenPayload {
  sub: number;
  email: string;
  perfil: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string = `${environment.api_url}/auth`;

  private http: HttpClient = inject(HttpClient);

  public login(email: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, { email, senha });
  }

  public salvarToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  public logout(): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, {});
  }

  public limparToken(): void {
    localStorage.removeItem('access_token');
  }

  public estaAutenticado(): boolean {
    return !!localStorage.getItem('access_token');
  }

  public getPerfil(): string | null {
    return this.decodePayload()?.perfil ?? null;
  }

  private decodePayload(): TokenPayload | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const normalizado = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalizado));
    } catch {
      return null;
    }
  }
}
