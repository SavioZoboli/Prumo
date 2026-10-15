import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, Subscription, finalize } from 'rxjs';
import { ButtonComponent } from '../../../components/button-component/button-component';
import {
  CadastroOrdemCompra,
  OrdemCompraApi,
  OrdemCompraLista,
  OrdemCompraPayload,
} from '../cadastro-ordem-compra/cadastro-ordem-compra';
import { OrdemCompraService } from '../../../services/ordem-compra.service';

@Component({
  selector: 'app-ordens-compra',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    ButtonComponent,
    CadastroOrdemCompra,
  ],
  templateUrl: './lista-ordem-compra.html',
  styleUrl: './lista-ordem-compra.scss',
})
export class ListaOrdemCompra implements OnDestroy {
  painelAberto = false;
  salvando = false;
  ordemEmEdicao: OrdemCompraLista | null = null;

  colunasExibidas = ['numero', 'fornecedor', 'dataEntrega', 'itens', 'total', 'status', 'acoes'];

  ordens = signal<OrdemCompraLista[]>([]);

  private ordemCompraService = inject(OrdemCompraService);
  private snackBar = inject(MatSnackBar);
  private observableHandler = new Subscription();

  constructor() {
    this.buscarOrdens();
  }

  ngOnDestroy(): void {
    this.observableHandler.unsubscribe();
  }

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

  buscarOrdens() {
    this.observableHandler.add(
      this.ordemCompraService.findAll().subscribe({
        next: (res: OrdemCompraApi[]) => this.ordens.set(res.map((o) => this.mapearOrdem(o))),
        error: (err) => {
          console.log(err);
          this.notificar('Erro ao buscar Ordens de Compras', 'error');
        },
      }),
    );
  }

  // API -> formato da tela: converte datas/numerics, calcula status e achata os itens.
  private mapearOrdem(o: OrdemCompraApi): OrdemCompraLista {
    const agora = new Date();
    const dt_entrega = o.dt_entrega ? new Date(o.dt_entrega) : null;
    const dt_entrega_prevista = o.dt_entrega_prevista ? new Date(o.dt_entrega_prevista) : null;

    return {
      id: o.id,
      fornecedor: o.fornecedor,
      dt_emissao: new Date(o.dt_emissao),
      dt_entrega,
      dt_entrega_prevista,
      valor_total: Number(o.valor_total ?? 0),
      status: dt_entrega
        ? 'FECHADO'
        : dt_entrega_prevista && dt_entrega_prevista < agora
          ? 'EM ATRASO'
          : 'ABERTO',
      itens: o.itens.map(({ quantidade, valor, material }) => ({
        ...material,
        ultimoValor: material.ultimoValor != null ? Number(material.ultimoValor) : null,
        quantidade,
        valor: Number(valor),
      })),
    };
  }

  salvarOrdem(payload: OrdemCompraPayload): void {
    const { fornecedorCodigo, dataEntrega, itens } = payload;
    const editando = this.ordemEmEdicao !== null;

    const request$:Observable<any> = this.ordemEmEdicao
      ? this.ordemCompraService.atualizar(this.ordemEmEdicao.id, dataEntrega, itens)
      : this.ordemCompraService.salvar(fornecedorCodigo, dataEntrega, itens);

    this.salvando = true;

    this.observableHandler.add(
      request$.pipe(finalize(() => (this.salvando = false))).subscribe({
        next: () => {
          this.fecharCadastro();
          this.buscarOrdens();
          this.notificar(
            editando
              ? 'Ordem de compra atualizada com sucesso.'
              : 'Ordem de compra cadastrada com sucesso.',
            'success',
          );
        },
        // Em erro o painel permanece aberto para o usuário não perder o que digitou.
        error: (err) => {
          console.log(err);
          this.notificar('Erro ao salvar ordem de compra', 'error');
        },
      }),
    );
  }

  // Apenas marca a ordem como recebida (dt_entrega = agora); não movimenta estoque.
  finalizar(ordem: OrdemCompraLista): void {
    this.observableHandler.add(
      this.ordemCompraService.receber(ordem.id).subscribe({
        next: () => {
          this.buscarOrdens();
          this.notificar('Ordem de compra finalizada com sucesso.', 'success');
        },
        error: (err) => {
          console.log(err);
          this.notificar('Erro ao finalizar ordem de compra', 'error');
        },
      }),
    );
  }

  private notificar(mensagem: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`${tipo}-snackbar`],
    });
  }
}