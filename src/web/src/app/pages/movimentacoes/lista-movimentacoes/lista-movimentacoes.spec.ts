import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError, type Observable } from 'rxjs';
import { vi } from 'vitest';

import { ListaMovimentacoes } from './lista-movimentacoes';
import { MovimentacaoPayload } from '../cadastro-movimentacao/cadastro-movimentacao';
import { MaterialService, Material } from '../../../services/material.service';
import { MovimentacaoService, MovimentacaoResponse } from '../../../services/movimentacao.service';

describe('ListaMovimentacoes', () => {
  let component: ListaMovimentacoes;
  let fixture: ComponentFixture<ListaMovimentacoes>;

  const materiaisMock: Material[] = [
    {
      id: 1,
      nome: 'Pastilha A1',
      codigo: 'PA1',
      equipamento: 'Torno',
      estoqueMinimo: 10,
      estoqueAtual: 120,
      fabricanteId: 1,
      ativo: true,
      ultimoValor: null,
      unidadeMedida: 'un',
      localizacao: null,
    },
  ];

  const movimentacoesMock: MovimentacaoResponse[] = [
    {
      id: 1,
      data: '2026-08-28T09:15:00.000Z',
      operacao: 'E',
      motivo: 'Recebimento de fornecedor',
      itens: [{ material_id: 1, quantidade: 50 }],
      is_estornado: false,
      motivo_estorno: null,
    },
  ];

  const materialServiceMock = {
    listAll: vi.fn(() => of(materiaisMock)),
  };

  const movimentacaoServiceMock = {
    listAll: vi.fn(() => of(movimentacoesMock)),
    create: vi.fn(() => of(movimentacoesMock[0])),
    estornar: vi.fn(() => of({ ...movimentacoesMock[0], is_estornado: true })),
  };

  const dialogMock = {
    open: vi.fn(() => ({
      afterClosed: (): Observable<string | null> => of('Motivo do estorno'),
    })),
  };

  beforeEach(async () => {
    materialServiceMock.listAll.mockClear().mockReturnValue(of(materiaisMock));
    movimentacaoServiceMock.listAll.mockClear().mockReturnValue(of(movimentacoesMock));
    movimentacaoServiceMock.create.mockClear().mockReturnValue(of(movimentacoesMock[0]));
    movimentacaoServiceMock.estornar
      .mockClear()
      .mockReturnValue(of({ ...movimentacoesMock[0], is_estornado: true }));
    dialogMock.open.mockClear().mockReturnValue({
      afterClosed: (): Observable<string | null> => of('Motivo do estorno'),
    });

    await TestBed.configureTestingModule({
      imports: [ListaMovimentacoes],
      providers: [
        { provide: MaterialService, useValue: materialServiceMock },
        { provide: MovimentacaoService, useValue: movimentacaoServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaMovimentacoes);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os materiais e as movimentações ao iniciar', () => {
    expect(materialServiceMock.listAll).toHaveBeenCalled();
    expect(movimentacaoServiceMock.listAll).toHaveBeenCalled();
    expect(component.materiaisDisponiveis()).toEqual(materiaisMock);
    expect(component.movimentacoes()).toEqual(movimentacoesMock);
  });

  it('deve resolver o material a partir do id', () => {
    expect(component.resolverMaterial(1)).toEqual(materiaisMock[0]);
    expect(component.resolverMaterial(999)).toBeUndefined();
  });

  it('deve abrir e fechar o painel de cadastro', () => {
    component.abrirCadastro();
    expect(component.painelAberto()).toBe(true);

    component.fecharCadastro();
    expect(component.painelAberto()).toBe(false);
  });

  it('deve cadastrar uma nova movimentação e recarregar a listagem', () => {
    const payload: MovimentacaoPayload = {
      operacao: 'E',
      motivo: 'Compra emergencial',
      itens: [{ materialId: 1, quantidade: 5 }],
    };

    component.abrirCadastro();
    component.salvarMovimentacao(payload);

    expect(movimentacaoServiceMock.create).toHaveBeenCalledWith({
      operacao: 'E',
      motivo: 'Compra emergencial',
      itens: [{ material_id: 1, quantidade: 5 }],
    });
    expect(component.painelAberto()).toBe(false);
    expect(movimentacaoServiceMock.listAll).toHaveBeenCalledTimes(2);
  });

  it('não deve fechar o painel se a API retornar erro ao cadastrar', () => {
    movimentacaoServiceMock.create.mockReturnValueOnce(
      throwError(() => ({ error: { message: 'Estoque insuficiente' } })),
    );

    component.abrirCadastro();
    component.salvarMovimentacao({
      operacao: 'S',
      motivo: 'Uso em produção',
      itens: [{ materialId: 1, quantidade: 999 }],
    });

    expect(component.painelAberto()).toBe(true);
  });

  it('deve estornar uma movimentação confirmada no dialog', () => {
    component.abrirEstorno(movimentacoesMock[0]);

    expect(dialogMock.open).toHaveBeenCalled();
    expect(movimentacaoServiceMock.estornar).toHaveBeenCalledWith(1, 'Motivo do estorno');
  });

  it('não deve estornar se o dialog for cancelado', () => {
    dialogMock.open.mockReturnValueOnce({
      afterClosed: (): Observable<string | null> => of(null),
    });

    component.abrirEstorno(movimentacoesMock[0]);

    expect(movimentacaoServiceMock.estornar).not.toHaveBeenCalled();
  });

  it('deve formatar o tipo de operação', () => {
    expect(component.formatarOperacao('E')).toBe('Entrada');
    expect(component.formatarOperacao('S')).toBe('Saída');
  });
});
