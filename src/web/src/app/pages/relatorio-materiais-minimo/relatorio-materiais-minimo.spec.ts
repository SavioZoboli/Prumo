import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioMateriaisMinimo } from './relatorio-materiais-minimo';

describe('RelatorioMateriaisMinimo', () => {
  let component: RelatorioMateriaisMinimo;
  let fixture: ComponentFixture<RelatorioMateriaisMinimo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioMateriaisMinimo],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioMateriaisMinimo);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve listar apenas materiais ativos no estoque mínimo ou abaixo', () => {
    expect(component.materiaisAbaixoDoMinimo.length).toBe(3);

    expect(
      component.materiaisAbaixoDoMinimo.every(
        (material) =>
          material.ativo &&
          material.estoqueAtual <= material.estoqueMinimo
      )
    ).toBe(true);
  });

  it('deve considerar material exatamente no mínimo como crítico', () => {
    const materialNoMinimo =
      component.materiaisAbaixoDoMinimo.find(
        (material) => material.codigo === 'FRESA010'
      );

    expect(materialNoMinimo).toBeTruthy();
    expect(materialNoMinimo?.estoqueAtual).toBe(
      materialNoMinimo?.estoqueMinimo
    );
  });

  it('não deve exibir material acima do estoque mínimo', () => {
    const materialNormal =
      component.materiaisAbaixoDoMinimo.find(
        (material) => material.codigo === 'BROCA008'
      );

    expect(materialNormal).toBeUndefined();
  });

  it('deve retornar a quantidade correta de materiais críticos', () => {
    expect(component.totalCriticos).toBe(3);
  });

  it('deve calcular a diferença necessária para atingir o estoque mínimo', () => {
    const material = component.materiais.find(
      (item) => item.codigo === 'CNMG120408'
    );

    expect(material).toBeTruthy();

    if (material) {
      expect(component.diferencaEstoque(material)).toBe(5);
    }
  });

  it('não deve retornar diferença negativa quando estoque estiver acima do mínimo', () => {
    const material = component.materiais.find(
      (item) => item.codigo === 'BROCA008'
    );

    expect(material).toBeTruthy();

    if (material) {
      expect(component.diferencaEstoque(material)).toBe(0);
    }
  });

  it('deve retornar status crítico', () => {
    expect(component.statusEstoque()).toBe('Crítico');
  });
});
