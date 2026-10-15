import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {
  Fornecedor,
  FornecedorService,
} from './fornecedor.service';
import { environment } from '../../environments/environment.development';

describe('FornecedorService', () => {
  let service: FornecedorService;
  let httpTesting: HttpTestingController;

  const url = `${environment.api_url}/fornecedores`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FornecedorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(FornecedorService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar os fornecedores', () => {
    const fornecedores: Fornecedor[] = [
      {
        id: 1,
        nome: 'Fornecedor Teste',
        cnpj: '12345678000190',
        ativo: true,
      },
    ];

    service.listAll().subscribe((resultado) => {
      expect(resultado).toEqual(fornecedores);
    });

    const requisicao = httpTesting.expectOne(url);

    expect(requisicao.request.method).toBe('GET');

    requisicao.flush(fornecedores);
  });

  it('deve cadastrar um fornecedor', () => {
    service
      .save('Fornecedor Teste', '12345678000190')
      .subscribe();

    const requisicao = httpTesting.expectOne(url);

    expect(requisicao.request.method).toBe('POST');

    expect(requisicao.request.body).toEqual({
      nome: 'Fornecedor Teste',
      cnpj: '12345678000190',
    });

    requisicao.flush(null);
  });

  it('deve buscar um fornecedor por ID', () => {
    const fornecedor: Fornecedor = {
      id: 1,
      nome: 'Fornecedor Teste',
      cnpj: '33000167000101',
      ativo: true,
    };

    service.findOne(1).subscribe((resultado) => {
      expect(resultado).toEqual(fornecedor);
    });

    const requisicao = httpTesting.expectOne(`${url}/1`);

    expect(requisicao.request.method).toBe('GET');

    requisicao.flush(fornecedor);
  });

  it('deve atualizar um fornecedor', () => {
    const fornecedorAtualizado: Fornecedor = {
      id: 1,
      nome: 'Fornecedor Atualizado',
      cnpj: '33000167000101',
      ativo: true,
    };

    service
      .update(1, {
        nome: 'Fornecedor Atualizado',
      })
      .subscribe((resultado) => {
        expect(resultado).toEqual(fornecedorAtualizado);
      });

    const requisicao = httpTesting.expectOne(`${url}/1`);

    expect(requisicao.request.method).toBe('PATCH');

    expect(requisicao.request.body).toEqual({
      nome: 'Fornecedor Atualizado',
    });

    requisicao.flush(fornecedorAtualizado);
  });

  it('deve desativar um fornecedor', () => {
    const fornecedorDesativado: Fornecedor = {
      id: 1,
      nome: 'Fornecedor Teste',
      cnpj: '33000167000101',
      ativo: false,
    };

    service.desativar(1).subscribe((resultado) => {
      expect(resultado).toEqual(fornecedorDesativado);
    });

    const requisicao = httpTesting.expectOne(`${url}/1`);

    expect(requisicao.request.method).toBe('DELETE');

    requisicao.flush(fornecedorDesativado);
  });
});