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
import { Material } from '../../../services/material.service';

export type TipoOperacao = 'E' | 'S';

// Payload emitido para o componente pai montar a chamada real à API
// (ver CreateMovimentacaoRequest em movimentacao.service.ts).
export interface MovimentacaoPayload {
  operacao: TipoOperacao;
  motivo: string;
  itens: {
    materialId: number;
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
  @Input() materiaisDisponiveis: Material[] = [];

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<MovimentacaoPayload>();

  salvando = false;

  movimentacaoForm: FormGroup = new FormGroup({
    operacao: new FormControl<TipoOperacao | null>(null, Validators.required),
    motivo: new FormControl('', Validators.required),
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

  get motivo() {
    return this.movimentacaoForm.get('motivo');
  }

  quantidadeInvalida(index: number): boolean {
    const controle = this.itens.at(index).get('quantidade');
    return !!controle?.invalid && !!controle?.touched;
  }

  private inicializarForm(): void {
    this.itens.clear();
    this.movimentacaoForm.reset();
    this.adicionarItem();
  }

  private criarItemForm(): FormGroup {
    return new FormGroup({
      material: new FormControl<Material | null>(null, Validators.required),
      quantidade: new FormControl(1, [Validators.required, Validators.min(1)]),
    });
  }

  adicionarItem(): void {
    this.itens.push(this.criarItemForm());
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
      motivo: dados.motivo.trim(),
      itens: dados.itens.map((item: { material: Material; quantidade: number }) => ({
        materialId: item.material.id,
        quantidade: item.quantidade,
      })),
    };

    this.salvar.emit(payload);
  }
}
