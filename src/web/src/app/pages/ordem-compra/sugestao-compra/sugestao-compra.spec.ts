import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SugestaoCompraComponent } from './sugestao-compra';
import { Material, MaterialService } from '../../../services/material.service';
import { OrdemCompraItem } from '../cadastro-ordem-compra/cadastro-ordem-compra';

describe('SugestaoCompraComponent', () => {
  const base = {
    equipamento: 'Torno CNC',
    fabricanteId: 1,
    ativo: true,
    ultimoValor: 10,
    unidadeMedida: 'UN',
    localizacao: null,
  };

  const materiais: Material[] = [
    { ...base, id: 1, nome: 'Abaixo', codigo: 'A', estoqueAtual: 2, estoqueMinimo: 10 },
    { ...base, id: 2, nome: 'Atenção', codigo: 'B', estoqueAtual: 11, estoqueMinimo: 10 },
    { ...base, id: 3, nome: 'Normal', codigo: 'C', estoqueAtual: 50, estoqueMinimo: 10 },
  ];

  function criar(): SugestaoCompraComponent {
    TestBed.configureTestingModule({
      imports: [SugestaoCompraComponent],
      providers: [{ provide: MaterialService, useValue: { listAll: () => of(materiais) } }],
    });

    const fixture = TestBed.createComponent(SugestaoCompraComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('deve listar só os materiais abaixo do mínimo e em atenção', () => {
    const component = criar();

    expect(component.sugestoes().map((s) => s.material.id)).toEqual([1, 2]);
    expect(component.totalAbaixo()).toBe(1);
    expect(component.totalAtencao()).toBe(1);
  });

  it('deve pré-selecionar apenas os abaixo do mínimo', () => {
    const component = criar();
    TestBed.tick();

    expect(component.quantidadeSelecionada()).toBe(1);
    expect(component.estaSelecionado(component.sugestoes()[0])).toBe(true);
    expect(component.estaSelecionado(component.sugestoes()[1])).toBe(false);
  });

  it('deve emitir os itens escolhidos ao gerar a ordem', () => {
    const component = criar();
    TestBed.tick();
    let emitidos: OrdemCompraItem[] = [];
    component.gerarOrdem.subscribe((itens) => (emitidos = itens));

    component.alternar(component.sugestoes()[1]);
    component.gerar();

    expect(emitidos.map((i) => i.id)).toEqual([1, 2]);
    expect(emitidos[0].quantidade).toBe(18);
  });
});
