import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Materiais } from './materiais';

describe('Materiais', () => {
  let component: Materiais;
  let fixture: ComponentFixture<Materiais>;

  const materialTeste = {
    nome: 'Inserto de torneamento',
    codigo: 'CNMG120408',
    equipamento: 'Torno CNC',
    fabricante: 'Sandvik',
    unidadeMedida: 'UN',
    localizacao: 'A-01',
    estoqueMinimo: 10,
    estoqueAtual: 25,
    ultimoValor: 25.9,
    ativo: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Materiais],
    }).compileComponents();

    fixture = TestBed.createComponent(Materiais);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com o painel fechado', () => {
    expect(component.painelAberto).toBe(false);
  });

  it('deve abrir o painel de cadastro', () => {
    component.abrirCadastro();

    expect(component.painelAberto).toBe(true);
    expect(component.materialEmEdicao).toBeNull();
  });

  it('deve fechar o painel de cadastro', () => {
    component.painelAberto = true;

    component.fecharCadastro();

    expect(component.painelAberto).toBe(false);
  });

  it('não deve possuir estoque atual como campo editável', () => {
    expect(component.materialForm.get('estoqueAtual')).toBeNull();
  });

  it('não deve cadastrar material quando o formulário for inválido', () => {
    component.abrirCadastro();

    component.salvarMaterial();

    expect(component.materiais.length).toBe(0);
    expect(component.materialForm.touched).toBe(true);
  });

  it('deve cadastrar um novo material com estoque atual igual a zero', () => {
    component.abrirCadastro();

    component.materialForm.setValue({
      nome: 'Inserto de torneamento',
      codigo: 'CNMG120408',
      equipamento: 'Torno CNC',
      fabricante: 'Sandvik',
      unidadeMedida: 'UN',
      localizacao: 'A-01',
      estoqueMinimo: 10,
      ultimoValor: '25,90',
      ativo: true,
    });

    component.salvarMaterial();

    expect(component.materiais.length).toBe(1);

    expect(component.materiais[0].nome).toBe(
      'Inserto de torneamento'
    );

    expect(component.materiais[0].estoqueAtual).toBe(0);
    expect(component.materiais[0].ultimoValor).toBe(25.9);
    expect(component.materiais[0].ativo).toBe(true);
  });

  it('deve abrir a edição com os dados do material', () => {
    component.abrirEdicao(materialTeste);

    expect(component.painelAberto).toBe(true);
    expect(component.materialEmEdicao).toBe(materialTeste);

    expect(component.materialForm.value.nome).toBe(
      'Inserto de torneamento'
    );

    expect(component.materialForm.value.codigo).toBe(
      'CNMG120408'
    );

    expect(component.materialForm.value.ultimoValor).toBe(25.9);
  });

  it('deve atualizar o material mantendo o estoque atual', () => {
    component.materiais = [materialTeste];

    component.abrirEdicao(materialTeste);

    component.materialForm.patchValue({
      nome: 'Inserto atualizado',
      ultimoValor: '30,50',
    });

    component.salvarMaterial();

    expect(component.materiais.length).toBe(1);

    expect(component.materiais[0].nome).toBe(
      'Inserto atualizado'
    );

    expect(component.materiais[0].estoqueAtual).toBe(25);
    expect(component.materiais[0].ultimoValor).toBe(30.5);
  });

  it('deve converter e formatar o último valor corretamente', () => {
    expect(component.converterValor('25,90')).toBe(25.9);
    expect(component.converterValor('25.90')).toBe(25.9);
    expect(component.converterValor('abc')).toBeNull();
    expect(component.converterValor('')).toBeNull();

    const valorFormatado = component.formatarValor(25.9);

    expect(valorFormatado).toContain('R$');
    expect(valorFormatado).toContain('25,90');
  });

  it('deve identificar estoque mínimo ou abaixo como crítico', () => {
    const normal = {
      ...materialTeste,
      estoqueAtual: 20,
      estoqueMinimo: 10,
    };

    const noMinimo = {
      ...materialTeste,
      estoqueAtual: 10,
      estoqueMinimo: 10,
    };

    const abaixoMinimo = {
      ...materialTeste,
      estoqueAtual: 5,
      estoqueMinimo: 10,
    };

    expect(component.statusEstoque(normal)).toBe('Normal');
    expect(component.statusEstoque(noMinimo)).toBe('Crítico');
    expect(component.statusEstoque(abaixoMinimo)).toBe('Crítico');

    expect(component.classeStatusEstoque(normal)).toBe('success');
    expect(component.classeStatusEstoque(noMinimo)).toBe('danger');
    expect(component.classeStatusEstoque(abaixoMinimo)).toBe('danger');
  });
});