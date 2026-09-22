import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ButtonComponent } from '../../../components/button-component/button-component';
import { MaterialService, Material } from '../../../services/material.service';
import {
  MovimentacaoService,
  MovimentacaoResponse,
} from '../../../services/movimentacao.service';
import { EstornoDialog } from '../../../components/estorno-dialog/estorno-dialog';
import { CadastroMovimentacao, MovimentacaoPayload } from '../cadastro-movimentacao/cadastro-movimentacao';

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    ButtonComponent,
    CadastroMovimentacao,
  ],
  templateUrl: './lista-movimentacoes.html',
  styleUrl: './lista-movimentacoes.scss',
})
export class ListaMovimentacoes {
  painelAberto = false;

  colunasExibidas = ['id', 'data', 'operacao', 'itens', 'motivo', 'acoes'];

  materiaisDisponiveis: Material[] = [];
  movimentacoes: MovimentacaoResponse[] = [];

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private materialService = inject(MaterialService);
  private movimentacaoService = inject(MovimentacaoService);

  constructor() {
    this.listarMateriais();
    this.listarMovimentacoes();
  }

  private listarMateriais(): void {
    this.materialService.listAll().subscribe({
      next: (materiais) => {
        this.materiaisDisponiveis = materiais;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar materiais.', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  private listarMovimentacoes(): void {
    this.movimentacaoService.listAll().subscribe({
      next: (movimentacoes) => {
        this.movimentacoes = movimentacoes;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar movimentações.', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  resolverMaterial(materialId: number): Material | undefined {
    return this.materiaisDisponiveis.find((material) => material.id === materialId);
  }

  abrirCadastro(): void {
    this.painelAberto = true;
  }

  fecharCadastro(): void {
    this.painelAberto = false;
  }

  salvarMovimentacao(payload: MovimentacaoPayload): void {
    this.movimentacaoService
      .create({
        operacao: payload.operacao,
        motivo: payload.motivo,
        itens: payload.itens.map((item) => ({
          material_id: item.materialId,
          quantidade: item.quantidade,
        })),
      })
      .subscribe({
        next: () => {
          this.fecharCadastro();
          this.listarMovimentacoes();
          this.listarMateriais();

          this.snackBar.open('Movimentação cadastrada com sucesso.', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        },
        error: (erro) => {
          this.snackBar.open(
            erro.error?.message ?? 'Erro ao cadastrar movimentação.',
            'Fechar',
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            },
          );
        },
      });
  }

  abrirEstorno(movimentacao: MovimentacaoResponse): void {
    const dialogRef = this.dialog.open(EstornoDialog, {
      data: { movimentacaoId: movimentacao.id },
    });

    dialogRef.afterClosed().subscribe((motivoEstorno: string | null) => {
      if (!motivoEstorno) {
        return;
      }

      this.movimentacaoService.estornar(movimentacao.id, motivoEstorno).subscribe({
        next: () => {
          this.listarMovimentacoes();
          this.listarMateriais();

          this.snackBar.open('Movimentação estornada com sucesso.', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        },
        error: (erro) => {
          this.snackBar.open(
            erro.error?.message ?? 'Erro ao estornar movimentação.',
            'Fechar',
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            },
          );
        },
      });
    });
  }

  formatarOperacao(operacao: 'E' | 'S'): string {
    return operacao === 'E' ? 'Entrada' : 'Saída';
  }
}
