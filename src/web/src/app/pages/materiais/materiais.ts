import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
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

import { InputComponent } from '../../components/input-component/input-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { MaterialService } from '../../services/material.service';

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
  painelAberto = false;
  salvando = false;

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

  materiais: MaterialLista[] = [];

  materialForm: FormGroup;

  // Mock temporário enquanto não existe integração com cadastro de fabricantes.
  fabricantes = [
    { id: 1, nome: 'Sandvik' },
    { id: 2, nome: 'Seco' },
    { id: 3, nome: 'Walter' },
    { id: 4, nome: 'Kennametal' },
    { id: 5, nome: 'Iscar' },
  ];

  unidadesMedida = ['UN', 'KG', 'CX'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private materialService: MaterialService
  ) {
    this.materialForm = this.fb.group({
      nome: ['', Validators.required],
      codigo: ['', Validators.required],
      equipamento: ['', Validators.required],
      fabricante: ['', Validators.required],
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

    this.listarMateriais();
  }

  listarMateriais(): void {
    this.materialService.listAll().subscribe({
      next: (materiais) => {
        this.materiais = materiais.map((material) => ({
          id: material.id,
          fabricanteId: material.fabricanteId,
          nome: material.nome,
          codigo: material.codigo,
          equipamento: material.equipamento,
          fabricante:
            this.fabricantes.find(
              (fabricante) =>
                fabricante.id === material.fabricanteId
            )?.nome ??
            `Fabricante ${material.fabricanteId}`,
          unidadeMedida: material.unidadeMedida ?? '',
          localizacao: material.localizacao ?? '',
          estoqueMinimo: material.estoqueMinimo,
          estoqueAtual: material.estoqueAtual,
          ultimoValor: material.ultimoValor,
          ativo: material.ativo,
        }));
      },
      error: (erro) => {
        console.error(
          'Erro ao carregar materiais:',
          erro
        );
      },
    });
  }

  abrirCadastro(): void {
    this.materialEmEdicao = null;

    this.materialForm.reset({
      unidadeMedida: 'UN',
      estoqueMinimo: 0,
      ultimoValor: null,
      ativo: true,
    });

    this.painelAberto = true;
  }

  abrirEdicao(material: MaterialLista): void {
    this.materialEmEdicao = material;

    this.materialForm.reset({
      nome: material.nome,
      codigo: material.codigo,
      equipamento: material.equipamento,
      fabricante: material.fabricante,
      unidadeMedida: material.unidadeMedida,
      localizacao: material.localizacao,
      estoqueMinimo: material.estoqueMinimo,
      ultimoValor: material.ultimoValor,
      ativo: material.ativo,
    });

    this.painelAberto = true;
  }

  fecharCadastro(): void {
    this.painelAberto = false;
  }

  salvarMaterial(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }

    const dadosMaterial =
      this.materialForm.getRawValue();

    const fabricanteSelecionado =
      this.fabricantes.find(
        (fabricante) =>
          fabricante.nome ===
          dadosMaterial.fabricante
      );

    if (!fabricanteSelecionado) {
      return;
    }

    const editando =
      this.materialEmEdicao !== null;

    const material = {
      nome: dadosMaterial.nome,
      codigo: dadosMaterial.codigo,
      equipamento: dadosMaterial.equipamento,
      fabricanteId: fabricanteSelecionado.id,
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

    this.salvando = true;

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

        this.salvando = false;
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
        this.salvando = false;

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

  get fabricante() {
    return this.materialForm.get('fabricante')!;
  }

  get estoqueMinimo() {
    return this.materialForm.get('estoqueMinimo')!;
  }
}