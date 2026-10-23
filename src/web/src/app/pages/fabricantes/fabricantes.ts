import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Dialog } from '../../components/dialog/dialog';
import { InputComponent } from '../../components/input-component/input-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { Fabricante, FabricanteService } from '../../services/fabricante.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-fabricantes',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './fabricantes.html',
  styleUrl: './fabricantes.scss',
})
export class Fabricantes {
  private dialog = inject(MatDialog);
  private fabricanteService = inject(FabricanteService);
  private snackBar = inject(MatSnackBar);

  // Só o ADMIN cria, edita e inativa; os demais perfis apenas consultam.
  readonly podeEditar = inject(AuthService).temPerfil(['ADMIN']);

  readonly colunasExibidas = this.podeEditar ? ['nome', 'acoes'] : ['nome'];

  fabricantes = signal<Fabricante[]>([]);
  carregando = signal(false);
  erro = signal(false);

  criando = signal(false);
  novoNome = signal('');

  editandoId = signal<number | null>(null);
  nomeEditado = signal('');

  salvando = signal(false);

  constructor() {
    this.listar();
  }

  listar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.fabricanteService.listAll().subscribe({
      next: (fabricantes) => {
        this.fabricantes.set(
          [...fabricantes].sort((a, b) => a.nome.localeCompare(b.nome)),
        );
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set(true);
      },
    });
  }

  abrirCriacao(): void {
    this.cancelarEdicao();
    this.novoNome.set('');
    this.criando.set(true);
  }

  cancelarCriacao(): void {
    this.criando.set(false);
    this.novoNome.set('');
  }

  salvarCriacao(): void {
    const nome = this.novoNome().trim();
    if (!nome) return;

    this.salvando.set(true);

    this.fabricanteService.create(nome).subscribe({
      next: () => {
        this.salvando.set(false);
        this.cancelarCriacao();
        this.listar();
        this.avisar('Fabricante cadastrado com sucesso.');
      },
      error: (erro) => {
        this.salvando.set(false);
        this.avisar(erro.error?.message ?? 'Erro ao cadastrar fabricante.');
      },
    });
  }

  iniciarEdicao(fabricante: Fabricante): void {
    this.cancelarCriacao();
    this.editandoId.set(fabricante.id);
    this.nomeEditado.set(fabricante.nome);
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.nomeEditado.set('');
  }

  salvarEdicao(): void {
    const nome = this.nomeEditado().trim();
    const id = this.editandoId();
    if (!nome || id === null) return;

    this.salvando.set(true);

    this.fabricanteService.update(id, nome).subscribe({
      next: () => {
        this.salvando.set(false);
        this.cancelarEdicao();
        this.listar();
        this.avisar('Fabricante atualizado com sucesso.');
      },
      error: (erro) => {
        this.salvando.set(false);
        this.avisar(erro.error?.message ?? 'Erro ao atualizar fabricante.');
      },
    });
  }

  inativar(fabricante: Fabricante): void {
    const confirmacao = this.dialog.open(Dialog, {
      data: {
        title: 'Inativar fabricante',
        message: `Deseja realmente inativar o fabricante ${fabricante.nome}? Ele deixará de aparecer na lista, mas os materiais já cadastrados com ele não serão alterados.`,
      },
    });

    confirmacao.afterClosed().subscribe((confirmou) => {
      if (!confirmou) return;

      this.fabricanteService.desativar(fabricante.id).subscribe({
        next: () => {
          this.listar();
          this.avisar('Fabricante inativado com sucesso.');
        },
        error: (erro) => {
          this.avisar(erro.error?.message ?? 'Erro ao inativar fabricante.');
        },
      });
    });
  }

  private avisar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
