import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { GerenciarFabricantes } from './gerenciar-fabricantes';
import { FabricanteService } from '../../services/fabricante.service';

describe('GerenciarFabricantes', () => {
  let component: GerenciarFabricantes;
  let fixture: ComponentFixture<GerenciarFabricantes>;

  const fabricantesMock = [
    { id: 1, nome: 'Sandvik', ativo: true },
    { id: 2, nome: 'Seco', ativo: true },
  ];

  const fabricanteServiceMock = {
    listAll: vi.fn(() => of(fabricantesMock)),
    update: vi.fn(() => of({ id: 1, nome: 'Sandvik Coromant', ativo: true })),
    desativar: vi.fn(() => of({ id: 2, nome: 'Seco', ativo: false })),
  };

  const dialogRefMock = { close: vi.fn() };

  // Por padrão o diálogo de confirmação responde "sim".
  const matDialogMock = {
    open: vi.fn(() => ({ afterClosed: () => of(true) })),
  };

  beforeEach(async () => {
    fabricanteServiceMock.listAll.mockClear();
    fabricanteServiceMock.update.mockClear();
    fabricanteServiceMock.desativar.mockClear();
    dialogRefMock.close.mockClear();
    matDialogMock.open.mockClear();

    fabricanteServiceMock.listAll.mockReturnValue(of(fabricantesMock));
    matDialogMock.open.mockReturnValue({ afterClosed: () => of(true) });

    await TestBed.configureTestingModule({
      imports: [GerenciarFabricantes],
      providers: [
        { provide: FabricanteService, useValue: fabricanteServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MatDialog, useValue: matDialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarFabricantes);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('deve criar o componente e listar os fabricantes', () => {
    expect(component).toBeTruthy();
    expect(component.fabricantes()).toEqual(fabricantesMock);
  });

  it('deve editar o nome de um fabricante', () => {
    component.iniciarEdicao(fabricantesMock[0]);

    expect(component.editandoId()).toBe(1);
    expect(component.nomeEditado()).toBe('Sandvik');

    component.nomeEditado.set('Sandvik Coromant');
    component.salvarEdicao();

    expect(fabricanteServiceMock.update).toHaveBeenCalledWith(
      1,
      'Sandvik Coromant'
    );

    expect(component.editandoId()).toBeNull();
  });

  it('não deve salvar edição com nome vazio', () => {
    component.iniciarEdicao(fabricantesMock[0]);

    component.nomeEditado.set('   ');
    component.salvarEdicao();

    expect(fabricanteServiceMock.update).not.toHaveBeenCalled();
  });

  it('deve inativar o fabricante após confirmação', () => {
    component.inativar(fabricantesMock[1]);

    expect(matDialogMock.open).toHaveBeenCalled();
    expect(fabricanteServiceMock.desativar).toHaveBeenCalledWith(2);
  });

  it('não deve inativar quando a confirmação for negada', () => {
    matDialogMock.open.mockReturnValue({ afterClosed: () => of(false) });

    component.inativar(fabricantesMock[1]);

    expect(fabricanteServiceMock.desativar).not.toHaveBeenCalled();
  });

  it('deve fechar o modal', () => {
    component.fechar();

    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
