import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { ButtonComponent } from '../../../components/button-component/button-component';
import { MaterialService, Material } from '../../../services/material.service';
import {
  MovimentacaoService,
  MovimentacaoResponse,
  FiltrosMovimentacao,
} from '../../../services/movimentacao.service';
import { EstornoDialog } from '../../../components/estorno-dialog/estorno-dialog';
import { CadastroMovimentacao, MovimentacaoPayload } from '../cadastro-movimentacao/cadastro-movimentacao';

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    ButtonComponent,
    CadastroMovimentacao,
  ],
  templateUrl: './lista-movimentacoes.html',
  styleUrl: './lista-movimentacoes.scss',
})
export class ListaMovimentacoes {
  painelAberto = signal(false);

  colunasExibidas = ['id', 'data', 'operacao', 'itens', 'motivo', 'acoes'];

  materiaisDisponiveis = signal<Material[]>([]);
  movimentacoes = signal<MovimentacaoResponse[]>([]);

  filtroOperacao = new FormControl<'' | 'E' | 'S'>('', { nonNullable: true });
  filtroMaterial = new FormControl<number | null>(null);
  filtroDataInicio = new FormControl<Date | null>(null);
  filtroDataFim = new FormControl<Date | null>(null);

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
        this.materiaisDisponiveis.set(materiais);
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
    const filtros: FiltrosMovimentacao = {};

    if (this.filtroOperacao.value) {
      filtros.operacao = this.filtroOperacao.value as 'E' | 'S';
    }
    if (this.filtroMaterial.value) {
      filtros.material_id = this.filtroMaterial.value;
    }
    if (this.filtroDataInicio.value) {
      filtros.dataInicio = this.filtroDataInicio.value.toISOString();
    }
    if (this.filtroDataFim.value) {
      const fim = new Date(this.filtroDataFim.value);
      fim.setHours(23, 59, 59, 999);
      filtros.dataFim = fim.toISOString();
    }

    this.movimentacaoService.listAll(filtros).subscribe({
      next: (movimentacoes) => {
        this.movimentacoes.set(movimentacoes);
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

  aplicarFiltros(): void {
    this.listarMovimentacoes();
  }

  limparFiltros(): void {
    this.filtroOperacao.setValue('');
    this.filtroMaterial.setValue(null);
    this.filtroDataInicio.setValue(null);
    this.filtroDataFim.setValue(null);
    this.listarMovimentacoes();
  }

  resolverMaterial(materialId: number): Material | undefined {
    return this.materiaisDisponiveis().find((material) => material.id === materialId);
  }

  abrirCadastro(): void {
    this.painelAberto.set(true);
  }

  fecharCadastro(): void {
    this.painelAberto.set(false);
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
