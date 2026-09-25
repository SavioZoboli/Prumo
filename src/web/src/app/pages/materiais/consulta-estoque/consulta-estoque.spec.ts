import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ConsultaEstoque } from './consulta-estoque';
import { MaterialService } from '../../../services/material.service';
import { FabricanteService } from '../../../services/fabricante.service';

describe('ConsultaEstoque', () => {
  let component: ConsultaEstoque;
  let fixture: ComponentFixture<ConsultaEstoque>;

  const fabricantesMock = [
    { id: 1, nome: 'Sandvik', ativo: true },
    { id: 2, nome: 'Seco Tools', ativo: true },
  ];

  // Cobre os três status (NORMAL, LIMITE e ABAIXO) e um inativo, que a API
  // normalmente não devolve mas a tela precisa ignorar de qualquer forma.
  const materiaisMock = [
    material({ id: 1, codigo: 'PST-001', nome: 'Pastilha CNMG 120408', estoqueAtual: 42, estoqueMinimo: 10 }),
    material({ id: 2, codigo: 'PST-014', nome: 'Pastilha DCMT 070204', estoqueAtual: 10, estoqueMinimo: 10 }),
    material({ id: 3, codigo: 'PST-022', nome: 'Pastilha TNMG 160408', estoqueAtual: 6, estoqueMinimo: 15 }),
    material({ id: 4, codigo: 'FRZ-005', nome: 'Fresa de topo 10mm', estoqueAtual: 25, estoqueMinimo: 8, fabricanteId: 2 }),
    material({ id: 5, codigo: 'BRC-011', nome: 'Broca de metal duro 8mm', estoqueAtual: 0, estoqueMinimo: 5 }),
    material({ id: 6, codigo: 'PST-030', nome: 'Pastilha WNMG 080408', estoqueAtual: 3, estoqueMinimo: 5, ativo: false }),
  ];

  function material(dados: Partial<ReturnType<typeof base>> & { id: number }) {
    return { ...base(), ...dados };
  }

  function base() {
    return {
      id: 0,
      nome: '',
      codigo: '',
      equipamento: 'Torno CNC 01',
      estoqueMinimo: 0,
      estoqueAtual: 0,
      fabricanteId: 1,
      ativo: true,
      ultimoValor: 10,
      unidadeMedida: 'UN',
      localizacao: 'A1-03',
    };
  }

  const materialServiceMock = {
    listAll: vi.fn(() => of(materiaisMock)),
  };

  const fabricanteServiceMock = {
    listAll: vi.fn(() => of(fabricantesMock)),
  };

  beforeEach(async () => {
    materialServiceMock.listAll.mockClear();
    fabricanteServiceMock.listAll.mockClear();

    materialServiceMock.listAll.mockReturnValue(of(materiaisMock));
    fabricanteServiceMock.listAll.mockReturnValue(of(fabricantesMock));

    await TestBed.configureTestingModule({
      imports: [ConsultaEstoque],
      providers: [
        { provide: MaterialService, useValue: materialServiceMock },
        { provide: FabricanteService, useValue: fabricanteServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaEstoque);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('deve carregar os materiais a partir da API', () => {
    expect(materialServiceMock.listAll).toHaveBeenCalled();
    expect(component.materiaisFiltrados().length).toBeGreaterThan(0);
  });

  it('deve traduzir o id do fabricante para o nome', () => {
    const fresa = component.materiaisFiltrados().find((m) => m.codigo === 'FRZ-005');

    expect(fresa?.fabricante).toBe('Seco Tools');
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
