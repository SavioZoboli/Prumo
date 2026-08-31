import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ButtonComponent } from '../../../components/button-component/button-component';
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

  // Mock — no lugar entrará a chamada ao service/API.
  materiaisDisponiveis: Material[] = [
    { codigo: 1, nome: 'Pastilha A1', estoqueAtual: 120 },
    { codigo: 2, nome: 'Pastilha B2', estoqueAtual: 45 },
    { codigo: 3, nome: 'Pastilha C2', estoqueAtual: 200 },
    { codigo: 4, nome: 'Pastilha C4', estoqueAtual: 8 },
  ];

  // Mock — no lugar entrará a chamada ao service/API.
  ordensCompraDisponiveis: OrdemCompraResumo[] = [
    { numero: 1001 },
    { numero: 1002 },
  ];

  movimentacoes: MovimentacaoLista[] = [
    {
      id: 1,
      data: new Date(2026, 7, 28, 9, 15),
      operacao: 'E',
      motivo: 'Recebimento de fornecedor',
      ordemCompra: this.ordensCompraDisponiveis[0],
      itens: [{ material: this.materiaisDisponiveis[0], quantidade: 50 }],
    },
    {
      id: 2,
      data: new Date(2026, 7, 29, 14, 30),
      operacao: 'S',
      motivo: 'Uso em produção',
      ordemCompra: null,
      itens: [{ material: this.materiaisDisponiveis[1], quantidade: 10 }],
    },
  ];

  constructor(private snackBar: MatSnackBar) {}

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
      material: this.materiaisDisponiveis.find((m) => m.codigo === item.materialCodigo)!,
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
