import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { InputComponent } from '../../components/input-component/input-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { UsuarioService } from '../../services/usuario.service';
import { MatDialog } from '@angular/material/dialog';
import { Dialog } from '../../components/dialog/dialog';

interface UsuarioLista {
  id: number;
  nome: string;
  sobrenome: string;
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

  dialog = inject(MatDialog);

  usuarioEmEdicao: UsuarioLista | null = null;

  colunasExibidas = ['nome', 'email', 'perfil', 'status', 'acoes'];

  usuarios = signal<UsuarioLista[]>([]);

  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private usuarioService: UsuarioService,
  ) {
    this.usuarioForm = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      perfil: ['USUARIO', Validators.required],
      ativo: [true],
    });

    this.listarUsuarios();
  }

  private listarUsuarios() {
    this.usuarioService.listAll().subscribe({
      next: (res) => {
        this.usuarios.set(res);
        console.log(res);
      },
      error: (err) => {
        this.snackBar.open('Erro ao listar', '', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
      },
    });
  }

  abrirCadastro(): void {
    this.usuarioEmEdicao = null;

    const senhaControl = this.usuarioForm.get('senha');

    senhaControl?.setValidators(Validators.required);
    senhaControl?.updateValueAndValidity();

    this.usuarioForm.reset({
      perfil: 'USUER',
      ativo: true,
      id: null,
    });

    this.painelAberto = true;
  }

  abrirEdicao(usuario: UsuarioLista): void {
    this.usuarioEmEdicao = usuario;

    const senhaControl = this.usuarioForm.get('senha');

    senhaControl?.clearValidators();
    senhaControl?.updateValueAndValidity();

    this.usuarioForm.reset({
      id: usuario.id,
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      senha: '',
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });

    this.usuarioForm.get('senha')?.disable();

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

    const du = this.usuarioForm.getRawValue();

    const editando = this.usuarioEmEdicao !== null;

    if (this.usuarioEmEdicao) {
      this.usuarioService
        .update(du.id, du.nome, du.sobrenome, du.email, du.ativo, du.perfil)
        .subscribe({
          next: (res) => {
            this.listarUsuarios();
            this.resetAndCloseForm();
          },
          error: (err) => {
            this.snackBar.open(err.message, 'Ok', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
          },
        });
    } else {
      this.usuarioService
        .create(du.nome, du.sobrenome, du.email, du.senha, du.perfil)
        .subscribe({
          next: (res) => {
            this.resetAndCloseForm();
            this.listarUsuarios();
          },
          error: (err) => {
            this.snackBar.open(err.message, 'Ok', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
          },
        });
    }

    this.snackBar.open(
      editando ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.',
      'Fechar',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      },
    );
  }

  desativar(usuario: UsuarioLista) {
    const dialogRef = this.dialog.open(Dialog, {
      data: {
        title: 'Exclusão de usuário',
        message: `Deseja realmente excluir o usuário ${usuario.nome}?`,
      },
    });

    dialogRef.afterClosed().subscribe((excluir) => {
      if (excluir) {
        this.usuarioService.desativar(usuario.id).subscribe({
          next: (res) => {
            this.snackBar.open('Usuário desativado com sucesso!', '', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
            this.listarUsuarios();
          },
          error: (err) => {
            this.snackBar.open('Erro ao desativar o usuário!', '', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
          },
        });
      }
    });
  }

  private resetAndCloseForm() {
    this.usuarioForm.reset({
      perfil: 'USUARIO',
      ativo: true,
    });

    this.salvando = false;
    this.fecharCadastro();
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

  get senha() {
    return this.usuarioForm.get('senha');
  }
}
