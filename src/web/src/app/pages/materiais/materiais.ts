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

interface MaterialLista {
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

  fabricantes = [
    'Sandvik',
    'Seco',
    'Walter',
    'Kennametal',
    'Iscar',
  ];

  unidadesMedida = ['UN', 'KG', 'CX'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.materialForm = this.fb.group({
      nome: ['', Validators.required],
      codigo: ['', Validators.required],
      equipamento: ['', Validators.required],
      fabricante: ['', Validators.required],
      unidadeMedida: ['UN', Validators.required],
      localizacao: [''],
      estoqueMinimo: [0, [Validators.required, Validators.min(0)]],
      estoqueAtual: [0, [Validators.required, Validators.min(0)]],
      ultimoValor: [null],
      ativo: [true],
    });
  }

  abrirCadastro(): void {
    this.materialEmEdicao = null;

    this.materialForm.reset({
      unidadeMedida: 'UN',
      estoqueMinimo: 0,
      estoqueAtual: 0,
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
      estoqueAtual: material.estoqueAtual,
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

    const dadosMaterial = this.materialForm.getRawValue();

    const editando = this.materialEmEdicao !== null;

    const material: MaterialLista = {
      nome: dadosMaterial.nome,
      codigo: dadosMaterial.codigo,
      equipamento: dadosMaterial.equipamento,
      fabricante: dadosMaterial.fabricante,
      unidadeMedida: dadosMaterial.unidadeMedida,
      localizacao: dadosMaterial.localizacao,
      estoqueMinimo: Number(dadosMaterial.estoqueMinimo),
      estoqueAtual: Number(dadosMaterial.estoqueAtual),
      ultimoValor: this.converterValor(dadosMaterial.ultimoValor),
      ativo: dadosMaterial.ativo,
    };

    if (this.materialEmEdicao) {
      this.materiais = this.materiais.map((item) =>
        item === this.materialEmEdicao ? material : item
      );
    } else {
      this.materiais = [...this.materiais, material];
    }

    this.materialForm.reset({
      unidadeMedida: 'UN',
      estoqueMinimo: 0,
      estoqueAtual: 0,
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
  }

  converterValor(valor: unknown): number | null {
    if (valor === null || valor === undefined || valor === '') {
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
    if (valor === null || !Number.isFinite(valor)) {
      return '-';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  statusEstoque(material: MaterialLista): string {
    if (material.estoqueAtual < material.estoqueMinimo) {
      return 'Crítico';
    }

    if (material.estoqueAtual === material.estoqueMinimo) {
      return 'Atenção';
    }

    return 'Normal';
  }

  classeStatusEstoque(material: MaterialLista): string {
    if (material.estoqueAtual < material.estoqueMinimo) {
      return 'danger';
    }

    if (material.estoqueAtual === material.estoqueMinimo) {
      return 'warning';
    }

    return 'success';
  }

  get nome() {
    return this.materialForm.get('nome');
  }

  get codigo() {
    return this.materialForm.get('codigo');
  }

  get equipamento() {
    return this.materialForm.get('equipamento');
  }

  get fabricante() {
    return this.materialForm.get('fabricante');
  }

  get estoqueMinimo() {
    return this.materialForm.get('estoqueMinimo');
  }

  get estoqueAtual() {
    return this.materialForm.get('estoqueAtual');
  }
}