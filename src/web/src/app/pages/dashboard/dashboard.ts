import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { AuthService } from '../../services/auth.service';
import {
  DashboardService,
  ItemCritico,
  MaterialConsumido,
  MaterialEmFalta,
  MovimentacaoSemanal,
  Paginado,
  ResumoDashboard,
  StatusEstoque,
  UltimaMovimentacao,
} from '../../services/dashboard.service';

type FiltroStatus = StatusEstoque | 'TODOS';

const SEMANAS = 4;
const ULTIMAS_MOVIMENTACOES = 4;
const LIMITE_PAGINA = 6;

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);

  // ADMIN e LIDER enxergam resumo e itens críticos; USUARIO só "em falta".
  readonly gestor = ['ADMIN', 'LIDER'].includes(this.authService.getPerfil() ?? '');

  readonly colunasCriticos = ['codigo', 'nome', 'estoque', 'status'];
  readonly colunasFalta = ['codigo', 'nome', 'status'];
  readonly colunasMovimentacoes = ['data', 'operacao', 'material', 'quantidade', 'usuario', 'op'];
  readonly colunasSemanas = ['semana', 'entradas', 'saidas', 'saldo'];
  readonly colunasConsumidos = ['posicao', 'material', 'quantidade'];
  readonly limitePagina = LIMITE_PAGINA;

  resumo = signal<ResumoDashboard | null>(null);
  criticos = signal<Paginado<ItemCritico> | null>(null);
  emFalta = signal<Paginado<MaterialEmFalta> | null>(null);
  movimentacoes = signal<UltimaMovimentacao[]>([]);
  semanas = signal<MovimentacaoSemanal[]>([]);
  consumidos = signal<MaterialConsumido[]>([]);

  filtroStatus = signal<FiltroStatus>('TODOS');
  paginaCriticos = signal(1);
  paginaFalta = signal(1);
  dataReferencia = signal(new Date());
  mesReferencia = signal(this.primeiroDiaDoMes(new Date()));

  carregando = signal({
    resumo: false,
    tabela: false,
    movimentacoes: false,
    semanas: false,
    consumidos: false,
  });
  erro = signal({
    resumo: false,
    tabela: false,
    movimentacoes: false,
    semanas: false,
    consumidos: false,
  });

  maiorConsumo = computed(() => Math.max(1, ...this.consumidos().map((c) => c.quantidade)));
  maiorSemana = computed(() =>
    Math.max(1, ...this.semanas().flatMap((s) => [s.entradas, s.saidas])),
  );
  // "Out/2026": o app não registra o locale pt-BR, então o pipe date sairia em inglês.
  mesRotulo = computed(() => {
    const data = this.mesReferencia();
    const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
      .format(data)
      .replace('.', '');
    return `${mes.charAt(0).toUpperCase()}${mes.slice(1)}/${data.getFullYear()}`;
  });
  ehMesAtual = computed(
    () => this.formatarMes(this.mesReferencia()) === this.formatarMes(new Date()),
  );

  constructor() {
    if (this.gestor) {
      this.carregarResumo();
    }
    this.carregarTabela();
    this.carregarMovimentacoes();
    this.carregarSemanas();
    this.carregarConsumidos();
  }

  carregarResumo(): void {
    this.executar('resumo', this.dashboardService.resumo(), (r) => this.resumo.set(r));
  }

  carregarTabela(): void {
    if (this.gestor) {
      const status = this.filtroStatus();
      this.executar(
        'tabela',
        this.dashboardService.itensCriticos({
          pagina: this.paginaCriticos(),
          limite: LIMITE_PAGINA,
          status: status === 'TODOS' ? undefined : status,
        }),
        (r) => this.criticos.set(r),
      );
    } else {
      this.executar(
        'tabela',
        this.dashboardService.materiaisEmFalta({
          pagina: this.paginaFalta(),
          limite: LIMITE_PAGINA,
        }),
        (r) => this.emFalta.set(r),
      );
    }
  }

  carregarMovimentacoes(): void {
    this.executar('movimentacoes', this.dashboardService.ultimasMovimentacoes(ULTIMAS_MOVIMENTACOES), (r) =>
      this.movimentacoes.set(r),
    );
  }

  carregarSemanas(): void {
    this.executar(
      'semanas',
      this.dashboardService.movimentacoesSemanais(
        SEMANAS,
        this.formatarData(this.dataReferencia()),
      ),
      (r) => this.semanas.set(r),
    );
  }

  carregarConsumidos(): void {
    this.executar(
      'consumidos',
      this.dashboardService.materiaisMaisConsumidos(
        6,
        this.formatarMes(this.mesReferencia()),
      ),
      (r) => this.consumidos.set(r),
    );
  }

  filtrarStatus(status: FiltroStatus): void {
    this.filtroStatus.set(status);
    this.paginaCriticos.set(1);
    this.carregarTabela();
  }

  // Cards do topo funcionam como atalho para o filtro da tabela.
  filtrarPeloCard(status: StatusEstoque): void {
    this.filtrarStatus(status);
  }

  mudarPagina(evento: PageEvent): void {
    const pagina = evento.pageIndex + 1;
    if (this.gestor) this.paginaCriticos.set(pagina);
    else this.paginaFalta.set(pagina);
    this.carregarTabela();
  }

  navegarSemanas(direcao: -1 | 1): void {
    const data = new Date(this.dataReferencia());
    data.setDate(data.getDate() + direcao * 7 * SEMANAS);
    this.dataReferencia.set(data);
    this.carregarSemanas();
  }

  navegarMes(direcao: -1 | 1): void {
    const mes = new Date(this.mesReferencia());
    mes.setMonth(mes.getMonth() + direcao);
    this.mesReferencia.set(mes);
    this.carregarConsumidos();
  }

  percentual(valor: number, maximo: number): number {
    return Math.round((valor / maximo) * 100);
  }

  rotuloOperacao(operacao: string): string {
    return operacao === 'E' ? 'Entrada' : 'Saída';
  }

  rotuloStatusEstoque(status: StatusEstoque): string {
    return status === 'ABAIXO_MINIMO' ? 'Abaixo do mínimo' : 'Em atenção';
  }

  rotuloStatusFalta(status: string): string {
    return status === 'SEM_ESTOQUE' ? 'Sem estoque' : 'Abaixo do mínimo';
  }

  // "yyyy-MM-dd" sem passar por UTC, para não deslocar o dia.
  semanaParaData(iso: string): Date {
    const [a, m, d] = iso.split('-').map(Number);
    return new Date(a, m - 1, d);
  }

  private executar<T>(
    chave: 'resumo' | 'tabela' | 'movimentacoes' | 'semanas' | 'consumidos',
    origem: import('rxjs').Observable<T>,
    sucesso: (valor: T) => void,
  ): void {
    this.carregando.update((c) => ({ ...c, [chave]: true }));
    this.erro.update((e) => ({ ...e, [chave]: false }));
    origem.subscribe({
      next: (valor) => {
        sucesso(valor);
        this.carregando.update((c) => ({ ...c, [chave]: false }));
      },
      error: () => {
        this.carregando.update((c) => ({ ...c, [chave]: false }));
        this.erro.update((e) => ({ ...e, [chave]: true }));
      },
    });
  }

  private primeiroDiaDoMes(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), 1);
  }

  private formatarData(data: Date): string {
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${data.getFullYear()}-${m}-${d}`;
  }

  private formatarMes(data: Date): string {
    return this.formatarData(data).slice(0, 7);
  }
}
