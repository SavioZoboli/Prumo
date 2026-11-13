import { TestBed } from '@angular/core/testing';

import { CadastroMovimentacao } from './cadastro-movimentacao';
import { Material } from '../../../services/material.service';

// Bug 07: enquanto a movimentação está sendo salva, o formulário não pode enviar de novo.
describe('CadastroMovimentacao — envio único ao salvar', () => {
  const material = { id: 1, nome: 'Pastilha A1', estoqueAtual: 120 } as Material;

  function criarComFormularioValido(): CadastroMovimentacao {
    const fixture = TestBed.createComponent(CadastroMovimentacao);
    const component = fixture.componentInstance;
    component.materiaisDisponiveis = [material];
    component.aberto = true;
    component.ngOnChanges({
      aberto: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
    });
    component.movimentacaoForm.setValue({
      operacao: 'E',
      motivo: 'Recebimento de fornecedor',
      itens: [{ material, quantidade: 10 }],
    });
    return component;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CadastroMovimentacao] }).compileComponents();
  });

  it('não emite o salvar enquanto a movimentação anterior está sendo salva', () => {
    const component = criarComFormularioValido();
    const emitidos: unknown[] = [];
    component.salvar.subscribe((p) => emitidos.push(p));

    component.salvando = true;
    component.salvarMovimentacao();

    expect(emitidos).toHaveLength(0);
  });

  it('desabilita o botão Salvar e mostra carregamento durante o envio', () => {
    const fixture = TestBed.createComponent(CadastroMovimentacao);
    fixture.componentRef.setInput('aberto', true);
    fixture.componentRef.setInput('salvando', true);
    fixture.detectChanges();

    const botaoSalvar: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

    expect(botaoSalvar.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('mat-progress-spinner')).not.toBeNull();
  });
});
