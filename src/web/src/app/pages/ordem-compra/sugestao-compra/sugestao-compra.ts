import { Component, computed, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';

import { ButtonComponent } from '../../../components/button-component/button-component';
import { Material, MaterialService } from '../../../services/material.service';
import { OrdemCompraItem, OrdemCompraLista } from '../cadastro-ordem-compra/cadastro-ordem-compra';
import { montarSugestoes, paraItensDaOrdem, SugestaoCompra } from './sugestao-compra.regras';

@Component({
  selector: 'app-sugestao-compra',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    ButtonComponent,
  ],
  templateUrl: './sugestao-compra.html',
  styleUrl: './sugestao-compra.scss',
})
export class SugestaoCompraComponent {
  // Ordens já carregadas pela tela de Compras, para marcar o que já está sendo comprado.
  ordens = input<OrdemCompraLista[]>([]);

  @Output() gerarOrdem = new EventEmitter<OrdemCompraItem[]>();

  readonly colunas = ['selecao', 'material', 'estoque', 'status', 'sugerida'];

  private materialService = inject(MaterialService);

  private materiais = signal<Material[]>([]);
  carregando = signal(true);
  erro = signal(false);
  expandido = signal(true);

  sugestoes = computed(() => montarSugestoes(this.materiais(), this.ordens()));

  totalAbaixo = computed(() => this.sugestoes().filter((s) => s.status === 'ABAIXO_MINIMO').length);
  totalAtencao = computed(() => this.sugestoes().filter((s) => s.status === 'EM_ATENCAO').length);

  private selecionados = signal<ReadonlySet<number>>(new Set());
  quantidadeSelecionada = computed(() => this.selecionados().size);

  constructor() {
    this.carregar();

    // A cada recarga, pré-seleciona o que está abaixo do mínimo.
    effect(() => {
      this.selecionados.set(
        new Set(
          this.sugestoes()
            .filter((s) => s.status === 'ABAIXO_MINIMO')
            .map((s) => s.material.id),
        ),
      );
    });
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.materialService.listAll().subscribe({
      next: (materiais) => {
        this.materiais.set(materiais);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set(true);
      },
    });
  }

  estaSelecionado(sugestao: SugestaoCompra): boolean {
    return this.selecionados().has(sugestao.material.id);
  }

  alternar(sugestao: SugestaoCompra): void {
    this.selecionados.update((atual) => {
      const novo = new Set(atual);
      novo.has(sugestao.material.id)
        ? novo.delete(sugestao.material.id)
        : novo.add(sugestao.material.id);
      return novo;
    });
  }

  gerar(): void {
    const escolhidas = this.sugestoes().filter((s) => this.estaSelecionado(s));
    if (escolhidas.length === 0) return;

    this.gerarOrdem.emit(paraItensDaOrdem(escolhidas));
  }
}
