import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ListaMovimentacoes } from './lista-movimentacoes';
import { MovimentacaoPayload, Material } from '../cadastro-movimentacao/cadastro-movimentacao';
import { MaterialService } from '../../../services/material.service';

describe('ListaMovimentacoes', () => {
  let component: ListaMovimentacoes;
  let fixture: ComponentFixture<ListaMovimentacoes>;

  const materiaisMock: Material[] = [
    { id: 1, nome: 'Pastilha A1', estoqueAtual: 120 },
    { id: 2, nome: 'Pastilha B2', estoqueAtual: 45 },
  ];

  const materialServiceMock = {
    listAll: vi.fn(() => of(materiaisMock)),
  };

  beforeEach(async () => {
    materialServiceMock.listAll.mockClear();
    materialServiceMock.listAll.mockReturnValue(of(materiaisMock));

    await TestBed.configureTestingModule({
      imports: [ListaMovimentacoes],
      providers: [
        {
          provide: MaterialService,
          useValue: materialServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaMovimentacoes);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os materiais disponíveis a partir do MaterialService', () => {
    expect(materialServiceMock.listAll).toHaveBeenCalled();
    expect(component.materiaisDisponiveis).toEqual(materiaisMock);
  });

  it('deve iniciar com o painel fechado', () => {
    expect(component.painelAberto).toBe(false);
  });

  it('deve abrir o painel de cadastro', () => {
    component.abrirCadastro();

    expect(component.painelAberto).toBe(true);
    expect(component.movimentacaoEmEdicao).toBeNull();
  });

  it('deve cadastrar uma nova movimentação', () => {
    const quantidadeInicial = component.movimentacoes.length;

    const payload: MovimentacaoPayload = {
      operacao: 'E',
      motivo: 'Compra emergencial',
      ordemCompraNumero: null,
      itens: [{ materialId: 1, quantidade: 5 }],
    };

    component.abrirCadastro();
    component.salvarMovimentacao(payload);

    expect(component.movimentacoes.length).toBe(quantidadeInicial + 1);
    expect(component.painelAberto).toBe(false);

    const nova = component.movimentacoes[component.movimentacoes.length - 1];
    expect(nova.operacao).toBe('E');
    expect(nova.itens[0].material.id).toBe(1);
    expect(nova.itens[0].quantidade).toBe(5);
  });

  it('deve atualizar uma movimentação existente', () => {
    const existente = component.movimentacoes[0];

    component.abrirEdicao(existente);

    component.salvarMovimentacao({
      operacao: 'S',
      motivo: 'Motivo atualizado',
      ordemCompraNumero: null,
      itens: [{ materialId: 2, quantidade: 3 }],
    });

    expect(component.movimentacoes[0].operacao).toBe('S');
    expect(component.movimentacoes[0].motivo).toBe('Motivo atualizado');
    expect(component.painelAberto).toBe(false);
  });

  it('deve formatar o tipo de operação', () => {
    expect(component.formatarOperacao('E')).toBe('Entrada');
    expect(component.formatarOperacao('S')).toBe('Saída');
  });
});
