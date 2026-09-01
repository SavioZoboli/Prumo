import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { InputComponent } from '../../../components/input-component/input-component';
import { ButtonComponent } from '../../../components/button-component/button-component';

export type TipoOperacao = 'E' | 'S';

export interface Material {
  codigo: number;
  nome: string;
  estoqueAtual: number;
}

export interface OrdemCompraResumo {
  numero: number;
}

export interface MovimentacaoItem {
  material: Material;
  quantidade: number;
}

export interface MovimentacaoLista {
  id: number;
  data: Date;
  operacao: TipoOperacao;
  motivo: string | null;
  ordemCompra: OrdemCompraResumo | null;
  itens: MovimentacaoItem[];
}

// Payload esperado pela API: operação, motivo, id da OC (opcional) e a lista
// de itens com código do material e quantidade.
export interface MovimentacaoPayload {
  operacao: TipoOperacao;
  motivo: string | null;
  ordemCompraNumero: number | null;
  itens: {
    materialCodigo: number;
    quantidade: number;
  }[];
}

@Component({
  selector: 'app-cadastro-movimentacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './cadastro-movimentacao.html',
  styleUrl: './cadastro-movimentacao.scss',
})
export class CadastroMovimentacao implements OnChanges {
  @Input() aberto = false;
  @Input() movimentacaoEmEdicao: MovimentacaoLista | null = null;
  @Input() materiaisDisponiveis: Material[] = [];
  @Input() ordensCompraDisponiveis: OrdemCompraResumo[] = [];

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<MovimentacaoPayload>();

  salvando = false;

  movimentacaoForm: FormGroup = new FormGroup({
    operacao: new FormControl<TipoOperacao | null>(null, Validators.required),
    motivo: new FormControl(''),
    ordemCompra: new FormControl<OrdemCompraResumo | null>(null),
    itens: new FormArray([]),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aberto'] && this.aberto) {
      this.inicializarForm();
    }
  }

  get itens(): FormArray {
    return this.movimentacaoForm.get('itens') as FormArray;
  }

  get operacao() {
    return this.movimentacaoForm.get('operacao');
  }

  private inicializarForm(): void {
    this.itens.clear();

    if (this.movimentacaoEmEdicao) {
      this.movimentacaoForm.patchValue({
        operacao: this.movimentacaoEmEdicao.operacao,
        motivo: this.movimentacaoEmEdicao.motivo ?? '',
        ordemCompra: this.movimentacaoEmEdicao.ordemCompra,
      });

      this.movimentacaoEmEdicao.itens.forEach((item) => this.adicionarItem(item));
    } else {
      this.movimentacaoForm.reset();
      this.adicionarItem();
    }
  }

  private criarItemForm(item?: MovimentacaoItem): FormGroup {
    return new FormGroup({
      material: new FormControl(item?.material ?? null, Validators.required),
      quantidade: new FormControl(item?.quantidade ?? 1, [Validators.required, Validators.min(1)]),
    });
  }

  adicionarItem(item?: MovimentacaoItem): void {
    this.itens.push(this.criarItemForm(item));
  }

  removerItem(index: number): void {
    if (this.itens.length === 1) {
      return;
    }

    this.itens.removeAt(index);
  }

  fecharPainel(): void {
    this.fechar.emit();
  }

  salvarMovimentacao(): void {
    if (this.movimentacaoForm.invalid) {
      this.movimentacaoForm.markAllAsTouched();
      return;
    }

    const dados = this.movimentacaoForm.getRawValue();

    const payload: MovimentacaoPayload = {
      operacao: dados.operacao,
      motivo: dados.motivo?.trim() ? dados.motivo.trim() : null,
      ordemCompraNumero: dados.ordemCompra?.numero ?? null,
      itens: dados.itens.map((item: { material: Material; quantidade: number }) => ({
        materialCodigo: item.material.codigo,
        quantidade: item.quantidade,
      })),
    };

    this.salvar.emit(payload);
  }
}
