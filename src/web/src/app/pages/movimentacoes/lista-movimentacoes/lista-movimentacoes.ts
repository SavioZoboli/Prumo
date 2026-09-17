import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ButtonComponent } from '../../../components/button-component/button-component';
import { MaterialService } from '../../../services/material.service';
import {
  CadastroMovimentacao,
  Material,
  MovimentacaoItem,
  MovimentacaoLista,
  MovimentacaoPayload,
  OrdemCompraResumo,
} from '../cadastro-movimentacao/cadastro-movimentacao';

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    ButtonComponent,
    CadastroMovimentacao,
  ],
  templateUrl: './lista-movimentacoes.html',
  styleUrl: './lista-movimentacoes.scss',
})
export class ListaMovimentacoes {
  painelAberto = false;
  movimentacaoEmEdicao: MovimentacaoLista | null = null;

  colunasExibidas = ['id', 'data', 'operacao', 'itens', 'motivo', 'acoes'];

  materiaisDisponiveis: Material[] = [];

  // Mock — no lugar entrará a chamada ao service/API.
  ordensCompraDisponiveis: OrdemCompraResumo[] = [
    { numero: 1001 },
    { numero: 1002 },
  ];


  movimentacoes: MovimentacaoLista[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private materialService: MaterialService,
  ) {
    this.listarMateriais();
  }

  private listarMateriais(): void {
    this.materialService.listAll().subscribe({
      next: (materiais) => {
        this.materiaisDisponiveis = materiais;
        this.movimentacoes = this.montarMovimentacoesMock(materiais);
      },
      error: () => {
        this.snackBar.open('Erro ao carregar materiais', '', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  private montarMovimentacoesMock(materiais: Material[]): MovimentacaoLista[] {
    if (materiais.length < 2) {
      return [];
    }

    return [
      {
        id: 1,
        data: new Date(2026, 7, 28, 9, 15),
        operacao: 'E',
        motivo: 'Recebimento de fornecedor',
        ordemCompra: this.ordensCompraDisponiveis[0],
        itens: [{ material: materiais[0], quantidade: 50 }],
      },
      {
        id: 2,
        data: new Date(2026, 7, 29, 14, 30),
        operacao: 'S',
        motivo: 'Uso em produção',
        ordemCompra: null,
        itens: [{ material: materiais[1], quantidade: 10 }],
      },
    ];
  }

  abrirCadastro(): void {
    this.movimentacaoEmEdicao = null;
    this.painelAberto = true;
  }

  abrirEdicao(movimentacao: MovimentacaoLista): void {
    this.movimentacaoEmEdicao = movimentacao;
    this.painelAberto = true;
  }

  fecharCadastro(): void {
    this.painelAberto = false;
  }

  salvarMovimentacao(payload: MovimentacaoPayload): void {
    const itens: MovimentacaoItem[] = payload.itens.map((item) => ({
      material: this.materiaisDisponiveis.find((m) => m.id === item.materialId)!,
      quantidade: item.quantidade,
    }));

    const ordemCompra = payload.ordemCompraNumero
      ? this.ordensCompraDisponiveis.find((oc) => oc.numero === payload.ordemCompraNumero) ?? null
      : null;

    const editando = this.movimentacaoEmEdicao !== null;

    if (this.movimentacaoEmEdicao) {
      this.movimentacoes = this.movimentacoes.map((movimentacao) =>
        movimentacao === this.movimentacaoEmEdicao
          ? { ...movimentacao, operacao: payload.operacao, motivo: payload.motivo, ordemCompra, itens }
          : movimentacao,
      );
    } else {
      this.movimentacoes = [
        ...this.movimentacoes,
        {
          id: this.proximoId(),
          data: new Date(),
          operacao: payload.operacao,
          motivo: payload.motivo,
          ordemCompra,
          itens,
        },
      ];
    }

    this.fecharCadastro();

    this.snackBar.open(
      editando
        ? 'Movimentação atualizada com sucesso.'
        : 'Movimentação cadastrada com sucesso.',
      'Fechar',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      },
    );
  }

  formatarOperacao(operacao: 'E' | 'S'): string {
    return operacao === 'E' ? 'Entrada' : 'Saída';
  }

  private proximoId(): number {
    return this.movimentacoes.length ? Math.max(...this.movimentacoes.map((m) => m.id)) + 1 : 1;
  }
}
