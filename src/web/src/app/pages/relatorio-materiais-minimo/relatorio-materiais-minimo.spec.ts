import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { RelatorioMateriaisMinimo } from './relatorio-materiais-minimo';
import {
  MaterialRelatorio,
  MaterialService,
} from '../../services/material.service';

describe('RelatorioMateriaisMinimo', () => {
  let component: RelatorioMateriaisMinimo;
  let fixture: ComponentFixture<RelatorioMateriaisMinimo>;

  const criticosMock: MaterialRelatorio[] = [
    {
      codigo: 'CNMG120408',
      nome: 'Pastilha CNMG 120408',
      equipamento: 'Torno CNC',
      fabricante: 'Sandvik',
      unidadeMedida: 'UN',
      estoqueAtual: 0,
      estoqueMinimo: 10,
      ativo: true,
    },
    {
      codigo: 'FRESA010',
      nome: 'Fresa de topo',
      equipamento: 'Centro de usinagem',
      fabricante: 'Seco',
      unidadeMedida: 'UN',
      estoqueAtual: 10,
      estoqueMinimo: 10,
      ativo: true,
    },
  ];

  const materialServiceMock = {
    getRelatorioMinimo: vi.fn(),
  };

  // O componente carrega os dados no construtor, então o retorno do mock
  // precisa ser definido antes de chamar esta função.
  async function criarComponente(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [RelatorioMateriaisMinimo],
      providers: [{ provide: MaterialService, useValue: materialServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioMateriaisMinimo);
    component = fixture.componentInstance;

    await fixture.whenStable();
    fixture.detectChanges();
  }

  function textoDaTela(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(() => {
    materialServiceMock.getRelatorioMinimo.mockReset();
  });

  it('deve criar o componente', async () => {
    materialServiceMock.getRelatorioMinimo.mockReturnValue(of(criticosMock));

    await criarComponente();

    expect(component).toBeTruthy();
  });

  it('deve carregar os materiais críticos a partir da API', async () => {
    materialServiceMock.getRelatorioMinimo.mockReturnValue(of(criticosMock));

    await criarComponente();

    expect(materialServiceMock.getRelatorioMinimo).toHaveBeenCalledTimes(1);
    expect(component.materiaisAbaixoDoMinimo()).toEqual(criticosMock);
    expect(component.carregando()).toBe(false);
    expect(component.erro()).toBe(false);
  });

  it('deve retornar a quantidade correta de materiais críticos', async () => {
    materialServiceMock.getRelatorioMinimo.mockReturnValue(of(criticosMock));

    await criarComponente();

    expect(component.totalCriticos).toBe(2);
  });

  it('deve exibir os materiais retornados pela API na tabela', async () => {
    materialServiceMock.getRelatorioMinimo.mockReturnValue(of(criticosMock));

    await criarComponente();

    expect(textoDaTela()).toContain('CNMG120408');
    expect(textoDaTela()).toContain('Sandvik');
    expect(textoDaTela()).toContain('FRESA010');
    expect(textoDaTela()).not.toContain('Nenhum material crítico');
  });

  it('deve exibir "Nenhum material crítico" quando a API responde com lista vazia', async () => {
    materialServiceMock.getRelatorioMinimo.mockReturnValue(of([]));

    await criarComponente();

    expect(component.erro()).toBe(false);
    expect(textoDaTela()).toContain('Nenhum material crítico');
  });

  it('deve indicar carregamento enquanto a API não responde, sem afirmar que não há críticos', async () => {
    const resposta$ = new Subject<MaterialRelatorio[]>();
    materialServiceMock.getRelatorioMinimo.mockReturnValue(resposta$);

    await criarComponente();

    expect(component.carregando()).toBe(true);
    expect(textoDaTela()).toContain('Carregando relatório');
    expect(textoDaTela()).not.toContain('Nenhum material crítico');

    resposta$.next(criticosMock);
    resposta$.complete();
    fixture.detectChanges();

    expect(component.carregando()).toBe(false);
    expect(textoDaTela()).toContain('CNMG120408');
  });

  it('não deve afirmar que não há materiais críticos quando a API falha', async () => {
    materialServiceMock.getRelatorioMinimo.mockReturnValue(
      throwError(() => new Error('falha na API')),
    );

    await criarComponente();

    expect(component.erro()).toBe(true);
    expect(component.carregando()).toBe(false);
    expect(component.materiaisAbaixoDoMinimo()).toEqual([]);

    expect(textoDaTela()).toContain('Não foi possível carregar o relatório');
    expect(textoDaTela()).not.toContain('Nenhum material crítico');

    const contador = (fixture.nativeElement as HTMLElement).querySelector(
      '.resumo-card strong',
    );
    expect(contador?.textContent?.trim()).toBe('–');
  });

  it('deve recarregar o relatório ao tentar novamente depois de um erro', async () => {
    materialServiceMock.getRelatorioMinimo.mockReturnValue(
      throwError(() => new Error('falha na API')),
    );

    await criarComponente();
    expect(component.erro()).toBe(true);

    materialServiceMock.getRelatorioMinimo.mockReturnValue(of(criticosMock));
    component.carregarRelatorio();
    fixture.detectChanges();

    expect(materialServiceMock.getRelatorioMinimo).toHaveBeenCalledTimes(2);
    expect(component.erro()).toBe(false);
    expect(component.materiaisAbaixoDoMinimo()).toEqual(criticosMock);
    expect(textoDaTela()).toContain('CNMG120408');
  });
});