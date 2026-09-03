import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputComponent } from '../../../components/input-component/input-component';
import { dataNaoAnteriorAHojeValidator } from '../../../../utils/validators.utils';

export interface Fornecedor {
  codigo: number;
  nome: string;
}

// Retorno esperado da API: código do material, nome, fabricante e último valor comprado.
export interface Material {
  codigo: number;
  nome: string;
  fabricante: string;
  ultimoValor: number;
}

export interface OrdemCompraItem {
  material: Material;
  quantidade: number;
  valor: number;
}

export interface OrdemCompraLista {
  numero: number;
  fornecedor: Fornecedor;
  dataEntrega: Date;
  status:'ABERTO'|'FECHADO'|'CANCELADO'
  itens: OrdemCompraItem[];
}

// Payload esperado pela API: código do fornecedor, data de entrega e a lista
// de materiais com id, quantidade e valor.
export interface OrdemCompraPayload {
  fornecedorCodigo: number;
  dataEntrega: Date;
  status:'ABERTO'|'FECHADO'|'CANCELADO'
  itens: {
    materialCodigo: number;
    quantidade: number;
    valor: number;
  }[];
}

@Component({
  selector: 'app-cadastro-ordem-compra',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    InputComponent,
  ],
  templateUrl: './cadastro-ordem-compra.html',
  styleUrl: './cadastro-ordem-compra.scss',
})
export class CadastroOrdemCompra implements OnChanges {
  @Input() aberto = false;
  @Input() ordemEmEdicao: OrdemCompraLista | null = null;
  @Input() fornecedores: Fornecedor[] = [];
  @Input() materiaisDisponiveis: Material[] = [];

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<OrdemCompraPayload>();

  salvando = false;

  ordemForm: FormGroup = new FormGroup({
    fornecedor: new FormControl(null, Validators.required),
    dataEntrega: new FormControl(null, [Validators.required,dataNaoAnteriorAHojeValidator()]),
    itens: new FormArray([]),
  });

  itensFiltrados: Observable<Material[]>[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aberto'] && this.aberto) {
      this.inicializarForm();
    }
  }

  get itens(): FormArray {
    return this.ordemForm.get('itens') as FormArray;
  }

   get dataEntrega() {
    return this.ordemForm.get('dataEntrega');
  }

  private inicializarForm(): void {
    this.itens.clear();
    this.itensFiltrados = [];

    if (this.ordemEmEdicao) {
      this.ordemForm.patchValue({
        fornecedor: this.ordemEmEdicao.fornecedor,
        dataEntrega: this.ordemEmEdicao.dataEntrega,
      });

      this.ordemEmEdicao.itens.forEach((item) => this.adicionarItem(item));
    } else {
      this.ordemForm.reset();
      this.adicionarItem();
    }
  }

  private criarItemForm(item?: OrdemCompraItem): FormGroup {
    return new FormGroup({
      material: new FormControl(item?.material ?? null, Validators.required),
      quantidade: new FormControl(item?.quantidade ?? 1, [Validators.required, Validators.min(1)]),
      valor: new FormControl(item?.valor ?? 0, [Validators.required, Validators.min(0.01)]),
    });
  }

  adicionarItem(item?: OrdemCompraItem): void {
    const grupo = this.criarItemForm(item);
    this.itens.push(grupo);

    this.itensFiltrados.push(
      grupo.get('material')!.valueChanges.pipe(
        startWith(item?.material ?? ''),
        map((valor) => this.filtrarMateriais(valor)),
      ),
    );
  }

  removerItem(index: number): void {
    if (this.itens.length === 1) {
      return;
    }

    this.itens.removeAt(index);
    this.itensFiltrados.splice(index, 1);
  }

  private filtrarMateriais(valor: string | Material | null): Material[] {
    const termo = (typeof valor === 'string' ? valor : valor?.nome ?? '').toLowerCase();

    return this.materiaisDisponiveis.filter((material) =>
      material.nome.toLowerCase().includes(termo),
    );
  }

  displayMaterial(material: Material): string {
    return material ? `${material.nome} (${material.fabricante})` : '';
  }

  selecionarMaterial(index: number, material: Material): void {
    this.itens.at(index).patchValue({
      material,
      valor: material.ultimoValor,
    });
  }

  calcularTotal(): number {
    return this.itens.controls.reduce((total, grupo) => {
      const { quantidade, valor } = grupo.getRawValue();
      return total + (quantidade || 0) * (valor || 0);
    }, 0);
  }

  fecharPainel(): void {
    this.fechar.emit();
  }

  salvarOrdem(): void {
    if (this.ordemForm.invalid) {
      this.ordemForm.markAllAsTouched();
      return;
    }

    const dados = this.ordemForm.getRawValue();

    const payload: OrdemCompraPayload = {
      fornecedorCodigo: dados.fornecedor.codigo,
      dataEntrega: dados.dataEntrega,
      status:'ABERTO',
      itens: dados.itens.map((item: { material: Material; quantidade: number; valor: number }) => ({
        materialCodigo: item.material.codigo,
        quantidade: item.quantidade,
        valor: item.valor,
      })),
    };

    this.salvar.emit(payload);
  }
}