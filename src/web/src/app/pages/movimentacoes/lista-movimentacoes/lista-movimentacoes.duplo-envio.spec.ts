import { TestBed } from '@angular/core/testing';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { ListaMovimentacoes } from './lista-movimentacoes';
import { MovimentacaoPayload } from '../cadastro-movimentacao/cadastro-movimentacao';
import { MaterialService } from '../../../services/material.service';
import {
  MovimentacaoResponse,
  MovimentacaoService,
} from '../../../services/movimentacao.service';

// Bug 07: um duplo clique em "Salvar" gravava a movimentação duas vezes.
describe('ListaMovimentacoes — envio único ao salvar', () => {
  const payload: MovimentacaoPayload = {
    operacao: 'E',
    motivo: 'Compra emergencial',
    itens: [{ materialId: 1, quantidade: 5 }],
  };

  let resposta: Subject<MovimentacaoResponse>;
  const movimentacaoServiceMock = {
    listAll: vi.fn(() => of([])),
    create: vi.fn(() => resposta.asObservable()),
  };
  const snackBarMock = { open: vi.fn() };

  function criarComponente(): ListaMovimentacoes {
    return TestBed.createComponent(ListaMovimentacoes).componentInstance;
  }

  beforeEach(() => {
    resposta = new Subject<MovimentacaoResponse>();
    movimentacaoServiceMock.create.mockClear();
    snackBarMock.open.mockClear();

    TestBed.configureTestingModule({
      imports: [ListaMovimentacoes],
      providers: [
        { provide: MaterialService, useValue: { listAll: () => of([]) } },
        { provide: MovimentacaoService, useValue: movimentacaoServiceMock },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MAT_DATE_LOCALE, useValue: 'PT-BR' },
        provideNativeDateAdapter(),
      ],
    });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBarMock });
  });

  it('envia uma única requisição mesmo com dois cliques antes da resposta', () => {
    const component = criarComponente();

    component.salvarMovimentacao(payload);
    component.salvarMovimentacao(payload);

    expect(movimentacaoServiceMock.create).toHaveBeenCalledTimes(1);
    expect(component.salvando()).toBe(true);
  });

  it('libera o salvar depois que a API responde com sucesso', () => {
    const component = criarComponente();

    component.salvarMovimentacao(payload);
    resposta.next({} as MovimentacaoResponse);
    resposta.complete();

    expect(component.salvando()).toBe(false);
  });

  it('libera o salvar depois de um erro, para o usuário tentar de novo', () => {
    const component = criarComponente();

    component.salvarMovimentacao(payload);
    resposta.error({ error: { message: 'Erro qualquer' } });

    expect(component.salvando()).toBe(false);

    resposta = new Subject<MovimentacaoResponse>();
    component.salvarMovimentacao(payload);
    expect(movimentacaoServiceMock.create).toHaveBeenCalledTimes(2);
  });
});
