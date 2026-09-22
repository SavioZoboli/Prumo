import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MatDialog,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import { Dialog } from '../dialog/dialog';
import { InputComponent } from '../input-component/input-component';
import { ButtonComponent } from '../button-component/button-component';
import {
  Fabricante,
  FabricanteService,
} from '../../services/fabricante.service';

@Component({
  selector: 'app-gerenciar-fabricantes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogTitle,
    MatDialogContent,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './gerenciar-fabricantes.html',
  styleUrl: './gerenciar-fabricantes.scss',
})
export class GerenciarFabricantes {
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<GerenciarFabricantes>);
  private fabricanteService = inject(FabricanteService);
  private snackBar = inject(MatSnackBar);


  fabricantes = signal<Fabricante[]>([]);
  carregando = signal(false);

  editandoId = signal<number | null>(null);
  nomeEditado = signal('');
  salvando = signal(false);

  constructor() {
    this.listar();
  }

  listar(): void {
    this.carregando.set(true);

    this.fabricanteService.listAll().subscribe({
      next: (fabricantes) => {
        this.fabricantes.set(fabricantes);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.avisar('Erro ao carregar fabricantes.');
      },
    });
  }

  iniciarEdicao(fabricante: Fabricante): void {
    this.editandoId.set(fabricante.id);
    this.nomeEditado.set(fabricante.nome);
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.nomeEditado.set('');
    this.salvando.set(false);
  }

  salvarEdicao(): void {
    const nome = this.nomeEditado().trim();
    const id = this.editandoId();

    if (!nome || id === null) {
      return;
    }

    this.salvando.set(true);

    this.fabricanteService.update(id, nome).subscribe({
      next: () => {
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
      if (!confirmou) {
        return;
      }

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

  fechar(): void {
    this.dialogRef.close();
  }

  private avisar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
