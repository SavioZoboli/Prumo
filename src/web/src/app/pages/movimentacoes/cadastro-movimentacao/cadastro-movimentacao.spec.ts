import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroMovimentacao, Material } from './cadastro-movimentacao';

describe('CadastroMovimentacao', () => {
  let component: CadastroMovimentacao;
  let fixture: ComponentFixture<CadastroMovimentacao>;

  const material: Material = { codigo: 1, nome: 'Pastilha A1', estoqueAtual: 120 };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroMovimentacao],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroMovimentacao);
    component = fixture.componentInstance;
    component.materiaisDisponiveis = [material];

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
    expect(component.movimentacaoEmEdicao).toBeNull();
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
      ordemCompra: null,
      itens: [{ material, quantidade: 10 }],
    });

    let payloadRecebido: any = null;
    component.salvar.subscribe((payload) => (payloadRecebido = payload));

    component.salvarMovimentacao();

    expect(payloadRecebido).toEqual({
      operacao: 'E',
      motivo: 'Recebimento de fornecedor',
      ordemCompraNumero: null,
      itens: [{ materialCodigo: 1, quantidade: 10 }],
    });
  });
});
