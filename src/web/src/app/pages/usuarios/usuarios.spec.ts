import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Usuarios } from './usuarios';
import { UsuarioService } from '../../services/usuario.service';

describe('Usuarios', () => {
  let component: Usuarios;
  let fixture: ComponentFixture<Usuarios>;

  const usuarioServiceMock = {
    listAll: vi.fn(() => of([])),
    create: vi.fn(() => of(1)),
    update: vi.fn(() => of(void 0)),
    desativar: vi.fn(() => of(void 0)),
  };

  beforeEach(async () => {
    usuarioServiceMock.listAll.mockClear();
    usuarioServiceMock.create.mockClear();
    usuarioServiceMock.update.mockClear();
    usuarioServiceMock.desativar.mockClear();

    await TestBed.configureTestingModule({
      imports: [Usuarios],
      providers: [
        {
          provide: UsuarioService,
          useValue: usuarioServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Usuarios);
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
    expect(component.usuarioEmEdicao).toBeNull();
    expect(component.usuarioForm.get('perfil')?.value).toBe('USUARIO');
    expect(component.usuarioForm.get('senha')?.enabled).toBe(true);
  });

  it('deve fechar o painel', () => {
    component.abrirCadastro();
    component.fecharCadastro();

    expect(component.painelAberto).toBe(false);
  });

  it('não deve cadastrar usuário com formulário inválido', () => {
    component.abrirCadastro();
    component.salvarUsuario();

    expect(component.usuarioForm.invalid).toBe(true);
    expect(usuarioServiceMock.create).not.toHaveBeenCalled();
  });

  it('deve cadastrar um novo usuário', () => {
    component.abrirCadastro();

    component.usuarioForm.patchValue({
      nome: 'John',
      sobrenome: 'Doe',
      email: 'john.doe@email.com',
      senha: 'senha123',
      perfil: 'USUARIO',
      ativo: true,
    });

    component.salvarUsuario();

    expect(usuarioServiceMock.create).toHaveBeenCalledWith(
      'John',
      'Doe',
      'john.doe@email.com',
      'senha123',
      'USUARIO',
    );

    expect(component.painelAberto).toBe(false);
  });

  it('deve abrir a edição com os dados do usuário', () => {
    const usuario = {
      id: 1,
      nome: 'John',
      sobrenome: 'Doe',
      email: 'john.doe@email.com',
      perfil: 'USUARIO',
      ativo: true,
    };

    component.usuarios.set([usuario]);

    component.abrirEdicao(usuario);

    expect(component.painelAberto).toBe(true);
    expect(component.usuarioEmEdicao).toBe(usuario);

    expect(component.usuarioForm.get('id')?.value).toBe(1);
    expect(component.usuarioForm.get('nome')?.value).toBe('John');
    expect(component.usuarioForm.get('sobrenome')?.value).toBe('Doe');
    expect(component.usuarioForm.get('email')?.value).toBe(
      'john.doe@email.com',
    );
    expect(component.usuarioForm.get('perfil')?.value).toBe('USUARIO');
    expect(component.usuarioForm.get('ativo')?.value).toBe(true);
    expect(component.usuarioForm.get('senha')?.disabled).toBe(true);
  });

  it('deve atualizar um usuário existente', () => {
    const usuario = {
      id: 1,
      nome: 'John',
      sobrenome: 'Doe',
      email: 'john.doe@email.com',
      perfil: 'USUARIO',
      ativo: true,
    };

    component.usuarios.set([usuario]);

    component.abrirEdicao(usuario);

    component.usuarioForm.patchValue({
      nome: 'John Atualizado',
      perfil: 'LIDER',
    });

    component.salvarUsuario();

    expect(usuarioServiceMock.update).toHaveBeenCalledWith(
      1,
      'John Atualizado',
      'Doe',
      'john.doe@email.com',
      true,
      'LIDER',
    );

    expect(component.painelAberto).toBe(false);
  });

  it('deve validar formato do e-mail', () => {
    const email = component.usuarioForm.get('email');

    email?.setValue('email-invalido');

    expect(email?.invalid).toBe(true);

    email?.setValue('john@email.com');

    expect(email?.valid).toBe(true);
  });

  it('deve formatar o perfil do usuário', () => {
    expect(component.formatarPerfil('ADMIN')).toBe('Administrador');
    expect(component.formatarPerfil('LIDER')).toBe('Líder');
    expect(component.formatarPerfil('USUARIO')).toBe('Usuário');
  });
});