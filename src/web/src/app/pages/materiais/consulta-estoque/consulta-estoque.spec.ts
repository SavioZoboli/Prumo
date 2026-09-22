import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEstoque } from './consulta-estoque';

describe('ConsultaEstoque', () => {
  let component: ConsultaEstoque;
  let fixture: ComponentFixture<ConsultaEstoque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaEstoque],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaEstoque);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve ignorar materiais inativos nos totais e na listagem', () => {
    const materiaisFiltrados = component.materiaisFiltrados();

    expect(materiaisFiltrados.some((m) => !m.ativo)).toBe(false);
    expect(component.totalAtivos()).toBe(materiaisFiltrados.length);
  });

  it('deve classificar o status pela comparação entre estoque atual e mínimo', () => {
    expect(component.statusDe({ estoqueAtual: 42, estoqueMinimo: 10 } as any)).toBe('NORMAL');
    expect(component.statusDe({ estoqueAtual: 10, estoqueMinimo: 10 } as any)).toBe('LIMITE');
    expect(component.statusDe({ estoqueAtual: 0, estoqueMinimo: 5 } as any)).toBe('ABAIXO');
  });

  it('deve traduzir o status para um rótulo legível', () => {
    expect(component.rotuloStatus('NORMAL')).toBe('Normal');
    expect(component.rotuloStatus('LIMITE')).toBe('No limite');
    expect(component.rotuloStatus('ABAIXO')).toBe('Abaixo do mínimo');
  });

  it('deve contar corretamente os materiais abaixo do mínimo e no limite', () => {
    const abaixoEsperado = component
      .materiaisFiltrados()
      .filter((m) => component.statusDe(m) === 'ABAIXO').length;

    expect(component.totalAbaixoDoMinimo()).toBeGreaterThan(0);
    expect(component.totalNoLimite()).toBeGreaterThan(0);
    expect(abaixoEsperado).toBeLessThanOrEqual(component.totalAtivos());
  });

  it('deve filtrar materiais por texto de busca (nome, código ou equipamento)', () => {
    component.busca.setValue('fresa');
    component.onBuscaChange();

    const resultado = component.materiaisFiltrados();

    expect(resultado.length).toBeGreaterThan(0);
    expect(
      resultado.every((m) => m.nome.toLowerCase().includes('fresa')),
    ).toBe(true);
  });

  it('deve filtrar materiais por status', () => {
    component.onFiltroStatusChange('ABAIXO');

    const resultado = component.materiaisFiltrados();

    expect(resultado.every((m) => component.statusDe(m) === 'ABAIXO')).toBe(true);
    expect(component.pageIndex()).toBe(0);
  });

  it('deve limpar os filtros aplicados', () => {
    component.busca.setValue('pastilha');
    component.onFiltroStatusChange('ABAIXO');
    component.pageIndex.set(2);

    component.limparFiltros();

    expect(component.busca.value).toBe('');
    expect(component.filtroStatus()).toBe('TODOS');
    expect(component.pageIndex()).toBe(0);
  });

  it('deve paginar os materiais filtrados de acordo com o tamanho de página', () => {
    component.pageSize.set(2);
    component.onPageChange({ pageIndex: 0, pageSize: 2, length: 0 } as any);

    expect(component.materiaisPaginados().length).toBeLessThanOrEqual(2);
  });
});
