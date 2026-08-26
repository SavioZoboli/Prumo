import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ButtonComponent } from '../../../components/button-component/button-component';
import { CadastroOrdemCompra, Fornecedor, Material, OrdemCompraItem, OrdemCompraLista, OrdemCompraPayload } from "../cadastro-ordem-compra/cadastro-ordem-compra";


@Component({
  selector: 'app-ordens-compra',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    ButtonComponent,
    CadastroOrdemCompra
],
  templateUrl: './lista-ordem-compra.html',
  styleUrl: './lista-ordem-compra.scss',
})
export class ListaOrdemCompra {
  painelAberto = false;
  ordemEmEdicao: OrdemCompraLista | null = null;

  colunasExibidas = ['numero', 'fornecedor', 'dataEntrega', 'itens', 'total', 'acoes'];

  // Mock — no lugar entrará a chamada ao service/API.
  fornecedores: Fornecedor[] = [
    { codigo: 1, nome: 'Metalúrgica Ferro Forte Ltda' },
    { codigo: 2, nome: 'Madeireira Bom Pinho' },
    { codigo: 3, nome: 'Distribuidora Aço Sul' },
  ];

  // Mock do retorno da API: código, nome, fabricante e último valor comprado.
  materiaisDisponiveis: Material[] = [
    { codigo: 1, nome: 'Pastilha A1', fabricante: 'Metal Ltda', ultimoValor: 12.5 },
    { codigo: 2, nome: 'Pastilha B2', fabricante: 'Ceras Brasil', ultimoValor: 8.9 },
    { codigo: 3, nome: 'Pastilha C2', fabricante: 'Madeireira Bom Pinho', ultimoValor: 22.3 },
    { codigo: 4, nome: 'Pastilha C4', fabricante: 'Aço Sul', ultimoValor: 45.0 },
  ];

  ordens: OrdemCompraLista[] = [
    {
      numero: 1001,
      fornecedor: this.fornecedores[0],
      dataEntrega: new Date(2026, 8, 10),
      itens: [{ material: this.materiaisDisponiveis[0], quantidade: 50, valor: 12.5 }],
    },
  ];

  constructor(private snackBar: MatSnackBar) {}

  abrirCadastro(): void {
    this.ordemEmEdicao = null;
    this.painelAberto = true;
  }

  abrirEdicao(ordem: OrdemCompraLista): void {
    this.ordemEmEdicao = ordem;
    this.painelAberto = true;
  }

  fecharCadastro(): void {
    this.painelAberto = false;
  }

  salvarOrdem(payload: OrdemCompraPayload): void {
    const fornecedor = this.fornecedores.find((f) => f.codigo === payload.fornecedorCodigo)!;

    const itens: OrdemCompraItem[] = payload.itens.map((item) => ({
      material: this.materiaisDisponiveis.find((m) => m.codigo === item.materialCodigo)!,
      quantidade: item.quantidade,
      valor: item.valor,
    }));

    const editando = this.ordemEmEdicao !== null;

    if (this.ordemEmEdicao) {
      this.ordens = this.ordens.map((ordem) =>
        ordem === this.ordemEmEdicao
          ? { ...ordem, fornecedor, dataEntrega: payload.dataEntrega, itens }
          : ordem,
      );
    } else {
      this.ordens = [
        ...this.ordens,
        { numero: this.proximoNumero(), fornecedor, dataEntrega: payload.dataEntrega, itens },
      ];
    }

    this.fecharCadastro();

    this.snackBar.open(
      editando
        ? 'Ordem de compra atualizada com sucesso.'
        : 'Ordem de compra cadastrada com sucesso.',
      'Fechar',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      },
    );
  }

  calcularTotal(itens: OrdemCompraItem[]): number {
    return itens.reduce((total, item) => total + item.quantidade * item.valor, 0);
  }

  private proximoNumero(): number {
    return this.ordens.length ? Math.max(...this.ordens.map((o) => o.numero)) + 1 : 1001;
  }
}