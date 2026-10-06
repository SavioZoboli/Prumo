import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  MaterialService,
  MaterialRelatorio,
} from '../../services/material.service';

@Component({
  selector: 'app-relatorio-materiais-minimo',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './relatorio-materiais-minimo.html',
  styleUrl: './relatorio-materiais-minimo.scss',
})
export class RelatorioMateriaisMinimo {
  colunasExibidas = [
    'codigo',
    'nome',
    'equipamento',
    'fabricante',
    'estoqueAtual',
    'estoqueMinimo',
    'status',
  ];

  materiaisAbaixoDoMinimo = signal<MaterialRelatorio[]>([]);

  private materialService = inject(MaterialService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.carregarRelatorio();
  }

  private carregarRelatorio(): void {
    this.materialService.getRelatorioMinimo().subscribe({
      next: (materiais) => {
        this.materiaisAbaixoDoMinimo.set(materiais);
      },
      error: () => {
        this.snackBar.open(
          'Erro ao carregar o relatório de materiais.',
          '',
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

  get totalCriticos(): number {
    return this.materiaisAbaixoDoMinimo().length;
  }
}