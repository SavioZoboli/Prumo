import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { InputComponent } from '../../components/input-component/input-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { MaterialService } from '../../services/material.service';
import {
  Fabricante,
  FabricanteService,
} from '../../services/fabricante.service';
import { GerenciarFabricantes } from '../../components/gerenciar-fabricantes/gerenciar-fabricantes';

interface MaterialLista {
  id?: number;
  fabricanteId?: number;
  nome: string;
  codigo: string;
  equipamento: string;
  fabricante: string;
  unidadeMedida: string;
  localizacao: string;
  estoqueMinimo: number;
  estoqueAtual: number;
  ultimoValor: number | null;
  ativo: boolean;
}

@Component({
  selector: 'app-materiais',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSnackBarModule,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './materiais.html',
  styleUrl: './materiais.scss',
})
export class Materiais {
  painelAberto = signal(false);
  salvando = signal(false);

  materialEmEdicao: MaterialLista | null = null;

  colunasExibidas = [
    'codigo',
    'nome',
    'equipamento',
    'fabricante',
    'estoque',
    'ultimoValor',
    'status',
    'acoes',
  ];

  materiais = signal<MaterialLista[]>([]);

  materialForm: FormGroup;

  fabricantes = signal<Fabricante[]>([]);

  cadastrandoFabricante = signal(false);
  novoFabricante = signal('');
  salvandoFabricante = signal(false);

  unidadesMedida = ['UN', 'KG', 'CX'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private materialService: MaterialService,
    private fabricanteService: FabricanteService
  ) {
    this.materialForm = this.fb.group({
      nome: ['', Validators.required],
      codigo: ['', Validators.required],
      equipamento: ['', Validators.required],
      fabricanteId: [null, Validators.required],
      unidadeMedida: ['UN', Validators.required],
      localizacao: [''],
      estoqueMinimo: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^\d+$/),
        ],
      ],
      ultimoValor: [null],
      ativo: [true],
    });

    this.listarFabricantes();
  }

  listarFabricantes(): void {
    this.fabricanteService.listAll().subscribe({
      next: (fabricantes) => {
        this.fabricantes.set(fabricantes);

        const selecionado = this.materialForm.value.fabricanteId;

        if (
          selecionado &&
          !fabricantes.some((fabricante) => fabricante.id === selecionado)
        ) {
          this.materialForm.patchValue({ fabricanteId: null });
        }

        this.listarMateriais();
      },
      error: () => {
        this.listarMateriais();

        this.snackBar.open(
          'Erro ao carregar fabricantes.',
          'Fechar',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          }
        );
      },
    });
  }

  nomeFabricante(fabricanteId?: number): string {
    return (
      this.fabricantes().find(
        (fabricante) => fabricante.id === fabricanteId
      )?.nome ?? '-'
    );
  }

  listarMateriais(): void {
    this.materialService.listAll().subscribe({
      next: (materiais) => {
        this.materiais.set(materiais.map((material) => ({
          id: material.id,
          fabricanteId: material.fabricanteId,
          nome: material.nome,
          codigo: material.codigo,
          equipamento: material.equipamento,
          fabricante: this.nomeFabricante(material.fabricanteId),
          unidadeMedida: material.unidadeMedida ?? '',
          localizacao: material.localizacao ?? '',
          estoqueMinimo: material.estoqueMinimo,
          estoqueAtual: material.estoqueAtual,
          ultimoValor: material.ultimoValor,
          ativo: material.ativo,
        })));
      },
      error: (erro) => {
        console.error(
          'Erro ao carregar materiais:',
          erro
        );
      },
    });
  }

  abrirConsultaEstoque(): void {
    this.router.navigate(['/materiais/consulta-estoque']);
  }

  abrirCadastro(): void {
    this.materialEmEdicao = null;
    this.cancelarNovoFabricante();

    this.materialForm.reset({
      unidadeMedida: 'UN',
      estoqueMinimo: 0,
      ultimoValor: null,
      ativo: true,
    });

    this.painelAberto.set(true);
  }

  abrirEdicao(material: MaterialLista): void {
    this.materialEmEdicao = material;
    this.cancelarNovoFabricante();

    this.materialForm.reset({
      nome: material.nome,
      codigo: material.codigo,
      equipamento: material.equipamento,
      fabricanteId: material.fabricanteId,
      unidadeMedida: material.unidadeMedida,
      localizacao: material.localizacao,
      estoqueMinimo: material.estoqueMinimo,
      ultimoValor: material.ultimoValor,
      ativo: material.ativo,
    });

    this.painelAberto.set(true);
  }

  fecharCadastro(): void {
    this.painelAberto.set(false);
  }

  salvarMaterial(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }

    const dadosMaterial =
      this.materialForm.getRawValue();

    const editando =
      this.materialEmEdicao !== null;

    const material = {
      nome: dadosMaterial.nome,
      codigo: dadosMaterial.codigo,
      equipamento: dadosMaterial.equipamento,
      fabricanteId: Number(dadosMaterial.fabricanteId),
      unidadeMedida:
        dadosMaterial.unidadeMedida,
      localizacao: dadosMaterial.localizacao,
      estoqueMinimo: Number(
        dadosMaterial.estoqueMinimo
      ),
      ultimoValor: this.converterValor(
        dadosMaterial.ultimoValor
      ),
      ativo: dadosMaterial.ativo,
    };

    this.salvando.set(true);

    const requisicao =
      editando && this.materialEmEdicao?.id
        ? this.materialService.update(
            this.materialEmEdicao.id,
            material
          )
        : this.materialService.create(material);

    requisicao.subscribe({
      next: () => {
        this.listarMateriais();

        this.materialForm.reset({
          unidadeMedida: 'UN',
          estoqueMinimo: 0,
          ultimoValor: null,
          ativo: true,
        });

        this.salvando.set(false);
        this.fecharCadastro();

        this.snackBar.open(
          editando
            ? 'Material atualizado com sucesso.'
            : 'Material cadastrado com sucesso.',
          'Fechar',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          }
        );
      },
      error: (erro) => {
        this.salvando.set(false);

        this.snackBar.open(
          erro.error?.message ??
            'Erro ao salvar material.',
          'Fechar',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          }
        );
      },
    });
  }

  abrirGerenciarFabricantes(): void {
    const modal = this.dialog.open(GerenciarFabricantes, {
      width: '480px',
      maxWidth: '95vw',
    });

    modal.afterClosed().subscribe(() => this.listarFabricantes());
  }

  abrirNovoFabricante(): void {
    this.cadastrandoFabricante.set(true);
    this.novoFabricante.set('');
  }

  cancelarNovoFabricante(): void {
    this.cadastrandoFabricante.set(false);
    this.novoFabricante.set('');
    this.salvandoFabricante.set(false);
  }

  salvarNovoFabricante(): void {
    const nome = this.novoFabricante().trim();

    if (!nome) {
      return;
    }

    this.salvandoFabricante.set(true);

    this.fabricanteService.create(nome).subscribe({
      next: (fabricante) => {
        this.fabricantes.set(
          [...this.fabricantes(), fabricante].sort((a, b) =>
            a.nome.localeCompare(b.nome)
          )
        );
        this.materialForm.patchValue({
          fabricanteId: fabricante.id,
        });

        this.cancelarNovoFabricante();
      },
      error: (erro) => {
        this.salvandoFabricante.set(false);

        this.snackBar.open(
          erro.error?.message ??
            'Erro ao cadastrar fabricante.',
          'Fechar',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          }
        );
      },
    });
  }

  converterValor(valor: unknown): number | null {
    if (
      valor === null ||
      valor === undefined ||
      valor === ''
    ) {
      return null;
    }

    const valorConvertido = Number(
      String(valor)
        .trim()
        .replace(',', '.')
    );

    return Number.isFinite(valorConvertido)
      ? valorConvertido
      : null;
  }

  formatarValor(valor: number | null): string {
    if (
      valor === null ||
      !Number.isFinite(valor)
    ) {
      return '-';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  statusEstoque(
    material: MaterialLista
  ): string {
    if (
      material.estoqueAtual <=
      material.estoqueMinimo
    ) {
      return 'Crítico';
    }

    return 'Normal';
  }

  classeStatusEstoque(
    material: MaterialLista
  ): string {
    if (
      material.estoqueAtual <=
      material.estoqueMinimo
    ) {
      return 'danger';
    }

    return 'success';
  }

  get nome() {
    return this.materialForm.get('nome')!;
  }

  get codigo() {
    return this.materialForm.get('codigo')!;
  }

  get equipamento() {
    return this.materialForm.get('equipamento')!;
  }

  get fabricanteId() {
    return this.materialForm.get('fabricanteId')!;
  }

  get estoqueMinimo() {
    return this.materialForm.get('estoqueMinimo')!;
  }
}