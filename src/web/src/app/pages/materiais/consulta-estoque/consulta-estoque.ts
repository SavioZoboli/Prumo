import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { InputComponent } from '../../../components/input-component/input-component';
import { ButtonComponent } from '../../../components/button-component/button-component';
import { criarPaginatorIntlPtBr } from '../../../shared/paginator-intl-pt-br';
import { MaterialService } from '../../../services/material.service';
import { FabricanteService } from '../../../services/fabricante.service';


// Modelo da tela: o fabricante chega da API como id e aqui já vira nome, que é
// o que a busca e a exportação usam.
export interface MaterialEstoque {
  id: number;
  codigo: string;
  nome: string;
  equipamento: string;
  fabricante: string;
  unidadeMedida: string;
  localizacao: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
}

export type StatusEstoque = 'NORMAL' | 'LIMITE' | 'ABAIXO';
type FiltroStatus = 'TODOS' | StatusEstoque;

@Component({
  selector: 'app-consulta-estoque',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSnackBarModule,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './consulta-estoque.html',
  styleUrl: './consulta-estoque.scss',
  providers: [{ provide: MatPaginatorIntl, useFactory: criarPaginatorIntlPtBr }],
})
export class ConsultaEstoque {
  colunasExibidas = [
    'codigo',
    'nome',
    'equipamento',
    'fabricante',
    'estoqueAtual',
    'estoqueMinimo',
    'status',
  ];

  busca = new FormControl('', { nonNullable: true });
  private readonly buscaSignal = toSignal(this.busca.valueChanges, { initialValue: '' });

  filtroStatus = signal<FiltroStatus>('TODOS');

  pageIndex = signal(0);
  pageSize = signal(10);

  private readonly materiais = signal<MaterialEstoque[]>([]);

  carregando = signal(false);

  private readonly fabricanteService = inject(FabricanteService);
  private readonly materialService = inject(MaterialService);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    this.carregarFabricantes();
  }

  // Os materiais vêm com fabricanteId; os fabricantes precisam chegar antes
  // para a coluna exibir o nome. No erro, segue mesmo assim: melhor a lista
  // aparecer com o fabricante em branco do que a tela ficar vazia.
  private carregarFabricantes(): void {
    this.fabricanteService.listAll().subscribe({
      next: (fabricantes) => {
        const nomePorId = new Map(fabricantes.map((f) => [f.id, f.nome]));
        this.carregarMateriais(nomePorId);
      },
      error: () => {
        this.carregarMateriais(new Map());
        this.avisar('Erro ao carregar fabricantes.');
      },
    });
  }

  private carregarMateriais(nomePorId: Map<number, string>): void {
    this.carregando.set(true);

    this.materialService.listAll().subscribe({
      next: (materiais) => {
        this.materiais.set(
          materiais.map((material) => ({
            id: material.id,
            codigo: material.codigo,
            nome: material.nome,
            equipamento: material.equipamento,
            fabricante: nomePorId.get(material.fabricanteId) ?? '-',
            unidadeMedida: material.unidadeMedida ?? '',
            localizacao: material.localizacao ?? '',
            estoqueAtual: material.estoqueAtual,
            estoqueMinimo: material.estoqueMinimo,
            ativo: material.ativo,
          })),
        );

        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.avisar('Erro ao carregar materiais.');
      },
    });
  }

  private avisar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }


  private readonly materiaisAtivos = computed(() =>
    this.materiais().filter((material) => material.ativo),
  );

  totalAtivos = computed(() => this.materiaisAtivos().length);

  totalAbaixoDoMinimo = computed(
    () => this.materiaisAtivos().filter((m) => this.statusDe(m) === 'ABAIXO').length,
  );

  totalNoLimite = computed(
    () => this.materiaisAtivos().filter((m) => this.statusDe(m) === 'LIMITE').length,
  );

  materiaisFiltrados = computed(() => {
    const termo = (this.buscaSignal() ?? '').trim().toLowerCase();
    const status = this.filtroStatus();

    return this.materiaisAtivos().filter((material) => {
      const combinaTermo =
        !termo ||
        material.nome.toLowerCase().includes(termo) ||
        material.codigo.toLowerCase().includes(termo) ||
        material.equipamento.toLowerCase().includes(termo);

      const combinaStatus = status === 'TODOS' || this.statusDe(material) === status;

      return combinaTermo && combinaStatus;
    });
  });

  materiaisPaginados = computed(() => {
    const inicio = this.pageIndex() * this.pageSize();
    return this.materiaisFiltrados().slice(inicio, inicio + this.pageSize());
  });

  statusDe(material: MaterialEstoque): StatusEstoque {
    if (material.estoqueAtual < material.estoqueMinimo) return 'ABAIXO';
    if (material.estoqueAtual === material.estoqueMinimo) return 'LIMITE';
    return 'NORMAL';
  }

  rotuloStatus(status: StatusEstoque): string {
    const rotulos: Record<StatusEstoque, string> = {
      NORMAL: 'Normal',
      LIMITE: 'No limite',
      ABAIXO: 'Abaixo do mínimo',
    };
    return rotulos[status];
  }

  onBuscaChange(): void {
    this.pageIndex.set(0);
  }

  onFiltroStatusChange(status: FiltroStatus): void {
    this.filtroStatus.set(status);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  limparFiltros(): void {
    this.busca.setValue('');
    this.filtroStatus.set('TODOS');
    this.pageIndex.set(0);
  }

  async exportarExcel(): Promise<void> {
    const XLSX = await import('xlsx');

    const linhas = this.materiaisFiltrados().map((material) => ({
      Código: material.codigo,
      Nome: material.nome,
      Equipamento: material.equipamento,
      Fabricante: material.fabricante,
      'Unidade de medida': material.unidadeMedida,
      Localização: material.localizacao,
      'Estoque atual': material.estoqueAtual,
      'Estoque mínimo': material.estoqueMinimo,
      Status: this.rotuloStatus(this.statusDe(material)),
    }));

    const planilha = XLSX.utils.json_to_sheet(linhas);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, 'Estoque');

    const dataAtual = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(livro, `estoque-materiais-${dataAtual}.xlsx`);
  }
}
