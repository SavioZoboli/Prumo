import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroMovimentacao } from './cadastro-movimentacao';
import { Material } from '../../../services/material.service';

describe('CadastroMovimentacao', () => {
  let component: CadastroMovimentacao;
  let fixture: ComponentFixture<CadastroMovimentacao>;

  const material: Material = {
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
  };

  const outroMaterial: Material = {
    id: 2,
    nome: 'Pastilha B2',
    codigo: 'PB2',
    equipamento: 'Torno',
    estoqueMinimo: 5,
    estoqueAtual: 50,
    fabricanteId: 1,
    ativo: true,
    ultimoValor: null,
    unidadeMedida: 'un',
    localizacao: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroMovimentacao],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroMovimentacao);
    component = fixture.componentInstance;
    component.materiaisDisponiveis = [material, outroMaterial];

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com um item ao abrir para cadastro', () => {
    component.aberto = true;
    component.ngOnChanges({
      aberto: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
    });

    expect(component.itens.length).toBe(1);
  });

  it('não deve salvar com formulário inválido', () => {
    let payloadEmitido = false;
    component.salvar.subscribe(() => (payloadEmitido = true));

    component.aberto = true;
    component.ngOnChanges({
      aberto: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
    });

    component.salvarMovimentacao();

    expect(component.movimentacaoForm.invalid).toBe(true);
    expect(payloadEmitido).toBe(false);
  });

  it('deve adicionar e remover itens', () => {
    component.aberto = true;
    component.ngOnChanges({
      aberto: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
    });

    component.adicionarItem();
    expect(component.itens.length).toBe(2);

    component.removerItem(1);
    expect(component.itens.length).toBe(1);
  });

  it('não deve remover o último item', () => {
    component.aberto = true;
    component.ngOnChanges({
      aberto: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
    });

    component.removerItem(0);

    expect(component.itens.length).toBe(1);
  });

  it('deve montar o payload corretamente ao salvar', () => {
    component.aberto = true;
    component.ngOnChanges({
      aberto: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
    });

    component.movimentacaoForm.setValue({
      operacao: 'E',
      motivo: 'Recebimento de fornecedor',
      itens: [{ material, quantidade: 10 }],
    });

    let payloadRecebido: any = null;
    component.salvar.subscribe((payload) => (payloadRecebido = payload));

    component.salvarMovimentacao();

    expect(payloadRecebido).toEqual({
      operacao: 'E',
      motivo: 'Recebimento de fornecedor',
      itens: [{ materialId: 1, quantidade: 10 }],
    });
  });

  it('deve identificar material já selecionado em outra linha', () => {
    component.aberto = true;
    component.ngOnChanges({
      aberto: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
    });

    component.itens.at(0).patchValue({
      material,
    });

    component.adicionarItem();

    expect(
      component.materialSelecionadoEmOutroItem(material.id, 1),
    ).toBe(true);

    expect(
      component.materialSelecionadoEmOutroItem(outroMaterial.id, 1),
    ).toBe(false);
  });

  it('não deve salvar movimentação com material repetido', () => {
    component.aberto = true;
    component.ngOnChanges({
      aberto: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
    });

    component.adicionarItem();

    component.movimentacaoForm.setValue({
      operacao: 'E',
      motivo: 'Recebimento de fornecedor',
      itens: [
        {
          material,
          quantidade: 2,
        },
        {
          material,
          quantidade: 3,
        },
      ],
    });

    let payloadEmitido = false;
    component.salvar.subscribe(() => (payloadEmitido = true));

    component.salvarMovimentacao();

    expect(payloadEmitido).toBe(false);
  });
});