import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Usuarios } from './usuarios';

describe('Usuarios', () => {
  let component: Usuarios;
  let fixture: ComponentFixture<Usuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usuarios],
    }).compileComponents();

    fixture = TestBed.createComponent(Usuarios);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com o painel fechado', () => {
    expect(component.painelAberto).toBe(false);
  });

  it('deve abrir o painel de cadastro', () => {
    component.abrirCadastro();

    expect(component.painelAberto).toBe(true);
    expect(component.usuarioEmEdicao).toBeNull();
  });

  it('deve fechar o painel', () => {
    component.abrirCadastro();
    component.fecharCadastro();

    expect(component.painelAberto).toBe(false);
  });

  it('não deve cadastrar usuário com formulário inválido', () => {
    const quantidadeInicial = component.usuarios.length;

    component.abrirCadastro();
    component.salvarUsuario();

    expect(component.usuarios.length).toBe(quantidadeInicial);
    expect(component.usuarioForm.invalid).toBe(true);
  });

  it('deve cadastrar um novo usuário', () => {
    component.abrirCadastro();

    component.usuarioForm.setValue({
      nome: 'John',
      sobrenome: 'Doe',
      email: 'john.doe@email.com',
      usuario: 'john.doe',
      senha: 'senha123',
      perfil: 'USUARIO',
      ativo: true,
    });

    component.salvarUsuario();

    expect(component.usuarios.length).toBe(1);

    expect(component.usuarios[0]).toEqual({
      nome: 'John',
      sobrenome: 'Doe',
      email: 'john.doe@email.com',
      usuario: 'john.doe',
      perfil: 'USUARIO',
      ativo: true,
    });

    expect(component.painelAberto).toBe(false);
  });

  it('deve abrir a edição com os dados do usuário', () => {
    const usuario = {
      nome: 'John',
      sobrenome: 'Doe',
      email: 'john.doe@email.com',
      usuario: 'john.doe',
      perfil: 'USUARIO',
      ativo: true,
    };

    component.usuarios = [usuario];

    component.abrirEdicao(usuario);

    expect(component.painelAberto).toBe(true);
    expect(component.usuarioEmEdicao).toBe(usuario);

    expect(component.usuarioForm.get('nome')?.value).toBe('John');
    expect(component.usuarioForm.get('sobrenome')?.value).toBe('Doe');
    expect(component.usuarioForm.get('email')?.value).toBe(
      'john.doe@email.com'
    );
    expect(component.usuarioForm.get('usuario')?.value).toBe('john.doe');
    expect(component.usuarioForm.get('perfil')?.value).toBe('USUARIO');
    expect(component.usuarioForm.get('ativo')?.value).toBe(true);
  });

  it('deve atualizar um usuário existente', () => {
    const usuario = {
      nome: 'John',
      sobrenome: 'Doe',
      email: 'john.doe@email.com',
      usuario: 'john.doe',
      perfil: 'USUARIO',
      ativo: true,
    };

    component.usuarios = [usuario];

    component.abrirEdicao(usuario);

    component.usuarioForm.patchValue({
      nome: 'John Atualizado',
      perfil: 'LIDER',
    });

    component.salvarUsuario();

    expect(component.usuarios[0].nome).toBe('John Atualizado');
    expect(component.usuarios[0].perfil).toBe('LIDER');
    expect(component.usuarios.length).toBe(1);
    expect(component.painelAberto).toBe(false);
  });

  it('deve validar formato do e-mail', () => {
    const email = component.usuarioForm.get('email');

    email?.setValue('email-invalido');

    expect(email?.invalid).toBe(true);

    email?.setValue('john@email.com');

    expect(email?.valid).toBe(true);
  });
});