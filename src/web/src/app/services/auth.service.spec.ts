import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';

function tokenComExp(expEmSegundos: number): string {
  const payload = btoa(JSON.stringify({ sub: 1, email: 'a@a.com', perfil: 'ADMIN', iat: 0, exp: expEmSegundos }));
  return `header.${payload}.assinatura`;
}

describe('AuthService', () => {
  let service: AuthService;
  const agoraEmSegundos = () => Math.floor(Date.now() / 1000);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AuthService);
  });

  it('não autentica sem token', () => {
    expect(service.estaAutenticado()).toBe(false);
  });

  it('autentica com token dentro da validade', () => {
    service.salvarToken(tokenComExp(agoraEmSegundos() + 3600));
    expect(service.estaAutenticado()).toBe(true);
  });

  it('não autentica com token vencido', () => {
    service.salvarToken(tokenComExp(agoraEmSegundos() - 1));
    expect(service.estaAutenticado()).toBe(false);
  });

  it('não autentica com token malformado', () => {
    service.salvarToken('isso-nao-e-um-jwt');
    expect(service.estaAutenticado()).toBe(false);
  });
});
