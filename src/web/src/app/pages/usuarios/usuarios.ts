import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';

import { InputComponent } from '../../components/input-component/input-component';
import { ButtonComponent } from '../../components/button-component/button-component';

interface UsuarioLista {
  nome: string;
  sobrenome: string;
  usuario: string;
  email: string;
  perfil: string;
  ativo: boolean;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSnackBarModule,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  painelAberto = false;
  salvando = false;

  usuarioEmEdicao: UsuarioLista | null = null;

  colunasExibidas = [
    'nome',
    'usuario',
    'email',
    'perfil',
    'status',
    'acoes',
  ];

  usuarios: UsuarioLista[] = [];

  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.usuarioForm = this.fb.group({
      nome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      usuario: ['', Validators.required],
      senha: ['', Validators.required],
      perfil: ['USUARIO', Validators.required],
      ativo: [true],
    });
  }

  abrirCadastro(): void {
    this.usuarioEmEdicao = null;

    const senhaControl = this.usuarioForm.get('senha');

    senhaControl?.setValidators(Validators.required);
    senhaControl?.updateValueAndValidity();

    this.usuarioForm.reset({
      perfil: 'USUARIO',
      ativo: true,
    });

    this.painelAberto = true;
  }

  abrirEdicao(usuario: UsuarioLista): void {
    this.usuarioEmEdicao = usuario;

    const senhaControl = this.usuarioForm.get('senha');

    senhaControl?.clearValidators();
    senhaControl?.updateValueAndValidity();

    this.usuarioForm.reset({
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      usuario: usuario.usuario,
      senha: '',
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });

    this.painelAberto = true;
  }

  fecharCadastro(): void {
    this.painelAberto = false;
  }

  salvarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const dadosUsuario = this.usuarioForm.getRawValue();

    const editando = this.usuarioEmEdicao !== null;

    if (this.usuarioEmEdicao) {
      this.usuarios = this.usuarios.map((usuario) =>
        usuario === this.usuarioEmEdicao
          ? {
              nome: dadosUsuario.nome,
              sobrenome: dadosUsuario.sobrenome,
              usuario: dadosUsuario.usuario,
              email: dadosUsuario.email,
              perfil: dadosUsuario.perfil,
              ativo: dadosUsuario.ativo,
            }
          : usuario
      );
    } else {
      this.usuarios = [
        ...this.usuarios,
        {
          nome: dadosUsuario.nome,
          sobrenome: dadosUsuario.sobrenome,
          usuario: dadosUsuario.usuario,
          email: dadosUsuario.email,
          perfil: dadosUsuario.perfil,
          ativo: dadosUsuario.ativo,
        },
      ];
    }

    this.usuarioForm.reset({
      perfil: 'USUARIO',
      ativo: true,
    });

    this.salvando = false;
    this.fecharCadastro();

    this.snackBar.open(
      editando
        ? 'Usuário atualizado com sucesso.'
        : 'Usuário cadastrado com sucesso.',
      'Fechar',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      }
    );
  }

  formatarPerfil(perfil: string): string {
    const perfis: Record<string, string> = {
      ADMIN: 'Administrador',
      LIDER: 'Líder',
      USUARIO: 'Usuário',
    };

    return perfis[perfil] ?? perfil;
  }

  get nome() {
    return this.usuarioForm.get('nome');
  }

  get sobrenome() {
    return this.usuarioForm.get('sobrenome');
  }

  get email() {
    return this.usuarioForm.get('email');
  }

  get usuario() {
    return this.usuarioForm.get('usuario');
  }

  get senha() {
    return this.usuarioForm.get('senha');
  }
}