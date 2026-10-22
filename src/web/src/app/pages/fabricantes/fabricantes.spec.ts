import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { Fabricantes } from './fabricantes';
import { FabricanteService } from '../../services/fabricante.service';
import { AuthService } from '../../services/auth.service';

describe('Fabricantes', () => {
  const fabricantesMock = [
    { id: 2, nome: 'Seco', ativo: true },
    { id: 1, nome: 'Sandvik', ativo: true },
  ];

  const fabricanteServiceMock = {
    listAll: vi.fn(() => of(fabricantesMock)),
    create: vi.fn(() => of({ id: 3, nome: 'Mitsubishi', ativo: true })),
    update: vi.fn(() => of({ id: 1, nome: 'Sandvik Coromant', ativo: true })),
    desativar: vi.fn(() => of({ id: 2, nome: 'Seco', ativo: false })),
  };

  // Por padrão o diálogo de confirmação responde "sim".
  const matDialogMock = {
    open: vi.fn(() => ({ afterClosed: () => of(true) })),
  };

  function criar(perfil: string): Fabricantes {
    TestBed.configureTestingModule({
      imports: [Fabricantes],
      providers: [
        { provide: FabricanteService, useValue: fabricanteServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
        {
          provide: AuthService,
          useValue: { temPerfil: (perfis?: string[]) => !perfis || perfis.includes(perfil) },
        },
      ],
    });

    const fixture = TestBed.createComponent(Fabricantes);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    fabricanteServiceMock.listAll.mockReturnValue(of(fabricantesMock));
    matDialogMock.open.mockReturnValue({ afterClosed: () => of(true) });
  });

  it('deve listar os fabricantes em ordem alfabética', () => {
    const component = criar('ADMIN');

    expect(component.fabricantes().map((f) => f.nome)).toEqual(['Sandvik', 'Seco']);
  });

  it('deve liberar edição só para o ADMIN', () => {
    expect(criar('ADMIN').podeEditar).toBe(true);
    TestBed.resetTestingModule();
    expect(criar('LIDER').podeEditar).toBe(false);
    TestBed.resetTestingModule();
    expect(criar('USUARIO').podeEditar).toBe(false);
  });

  it('não deve mostrar a coluna de ações para quem só consulta', () => {
    expect(criar('LIDER').colunasExibidas).toEqual(['nome']);
  });

  it('deve cadastrar um novo fabricante', () => {
    const component = criar('ADMIN');

    component.abrirCriacao();
    component.novoNome.set('  Mitsubishi  ');
    component.salvarCriacao();

    expect(fabricanteServiceMock.create).toHaveBeenCalledWith('Mitsubishi');
    expect(component.criando()).toBe(false);
  });

  it('não deve cadastrar fabricante com nome vazio', () => {
    const component = criar('ADMIN');

    component.abrirCriacao();
    component.novoNome.set('   ');
    component.salvarCriacao();

    expect(fabricanteServiceMock.create).not.toHaveBeenCalled();
  });

  it('deve editar o nome de um fabricante', () => {
    const component = criar('ADMIN');

    component.iniciarEdicao(fabricantesMock[1]);
    component.nomeEditado.set('Sandvik Coromant');
    component.salvarEdicao();

    expect(fabricanteServiceMock.update).toHaveBeenCalledWith(1, 'Sandvik Coromant');
    expect(component.editandoId()).toBeNull();
  });

  it('deve inativar o fabricante após confirmação', () => {
    const component = criar('ADMIN');

    component.inativar(fabricantesMock[0]);

    expect(fabricanteServiceMock.desativar).toHaveBeenCalledWith(2);
  });

  it('não deve inativar quando a confirmação é cancelada', () => {
    const component = criar('ADMIN');
    matDialogMock.open.mockReturnValue({ afterClosed: () => of(false) });

    component.inativar(fabricantesMock[0]);

    expect(fabricanteServiceMock.desativar).not.toHaveBeenCalled();
  });
});
