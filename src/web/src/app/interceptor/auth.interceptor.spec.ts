import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const router = { navigate: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    router.navigate.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('envia o token no header Authorization', () => {
    localStorage.setItem('access_token', 'abc');
    http.get('/materiais').subscribe();

    const req = httpMock.expectOne('/materiais');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush([]);
  });

  it('no 401 limpa o token e manda para o login', () => {
    localStorage.setItem('access_token', 'vencido');
    http.get('/materiais').subscribe({ error: () => {} });

    httpMock.expectOne('/materiais').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['login']);
  });

  it('401 no próprio login não redireciona', () => {
    http.post('/auth/login', {}).subscribe({ error: () => {} });

    httpMock.expectOne('/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('outros erros não mexem na sessão', () => {
    localStorage.setItem('access_token', 'abc');
    http.get('/materiais').subscribe({ error: () => {} });

    httpMock.expectOne('/materiais').flush({}, { status: 403, statusText: 'Forbidden' });

    expect(localStorage.getItem('access_token')).toBe('abc');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
