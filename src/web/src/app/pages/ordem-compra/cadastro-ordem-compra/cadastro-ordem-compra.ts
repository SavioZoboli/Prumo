import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputComponent } from '../../../components/input-component/input-component';
import { dataNaoAnteriorAHojeValidator } from '../../../../utils/validators.utils';
import { formatarCNPJ } from '../../../../utils/formatarCnpj.utils';
import { CadastroFornecedor } from '../cadastro-fornecedor/cadastro-fornecedor';
import { Fornecedor, FornecedorService } from '../../../services/fornecedor.service';
import { Material, MaterialService } from '../../../services/material.service';
import { IOrdemCompraItem } from '../../../services/ordem-compra.service';

// ---------- Formato cru da API ----------
export interface ItemOrdemCompraApi {
  ordem_compra_id: number;
  material_id: number;
  quantidade: number;
  valor: string; // numeric do Postgres chega como string
  material: Material;
}

export interface OrdemCompraApi {
  id: number;
  fornecedor: Fornecedor;
  dt_emissao: string;
  dt_entrega_prevista: string | null;
  dt_entrega: string | null;
  valor_total: string | null;
  itens: ItemOrdemCompraApi[];
}

// ---------- Formato usado na tela ----------
// Item achatado: campos do Material + quantidade/valor do item.
export type OrdemCompraItem = Material & { quantidade: number; valor: number };

export interface OrdemCompraLista {
  id: number;
  fornecedor: Fornecedor;
  dt_emissao: Date;
  dt_entrega: Date | null;
  dt_entrega_prevista: Date | null;
  valor_total: number;
  status: 'ABERTO' | 'FECHADO' | 'EM ATRASO';
  itens: OrdemCompraItem[];
}

// Payload esperado pela API: código do fornecedor, data de entrega e a lista
// de materiais com id, quantidade e valor. O total é recalculado no backend.
export interface OrdemCompraPayload {
  fornecedorCodigo: number;
  dataEntrega: Date;
  itens: IOrdemCompraItem[];
}

// Impede texto livre no autocomplete: o valor precisa ser um Material selecionado.
function materialSelecionadoValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value;
  return v && typeof v === 'object' ? null : { materialInvalido: true };
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
    CadastroFornecedor,
  ],
  templateUrl: './cadastro-ordem-compra.html',
  styleUrl: './cadastro-ordem-compra.scss',
})
export class CadastroOrdemCompra implements OnChanges {
  @Input() aberto = false;
  @Input() ordemEmEdicao: OrdemCompraLista | null = null;
  @Input() salvando = false;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<OrdemCompraPayload>();

  fornecedores = signal<Fornecedor[]>([]);
  materiais = signal<Material[]>([]);
  isAddingFornecedor = signal(false);
  formatarCnpj = formatarCNPJ;

  ordemForm: FormGroup = new FormGroup({
    fornecedor: new FormControl(null, Validators.required),
    dataEntrega: new FormControl(null, [Validators.required, dataNaoAnteriorAHojeValidator()]),
    itens: new FormArray([]),
  });

  private fornecedorService = inject(FornecedorService);
  private materialService = inject(MaterialService);
  private snackBar = inject(MatSnackBar);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aberto'] && this.aberto) {
      this.inicializarForm();
      this.buscarFornecedores();
      this.buscarMateriais();
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
    this.isAddingFornecedor.set(false);
    this.ordemForm.enable();

    if (this.ordemEmEdicao) {
      this.ordemForm.patchValue({
        fornecedor: this.ordemEmEdicao.fornecedor,
        dataEntrega: this.ordemEmEdicao.dt_entrega_prevista,
      });

      this.ordemEmEdicao.itens.forEach((item) => this.adicionarItem(item));

      // Fornecedor não pode ser alterado em uma ordem existente.
      this.ordemForm.get('fornecedor')?.disable();
    } else {
      this.ordemForm.reset();
      this.adicionarItem();
    }
  }

  // Recebe o item achatado (Material + quantidade + valor) e separa de volta
  // em Material para alimentar o autocomplete.
  private criarItemForm(item?: OrdemCompraItem): FormGroup {
    let material: Material | null = null;

    if (item) {
      const { quantidade, valor, ...resto } = item;
      material = resto;
    }

    return new FormGroup({
      material: new FormControl(material, [Validators.required, materialSelecionadoValidator]),
      quantidade: new FormControl(item?.quantidade ?? 1, [Validators.required, Validators.min(1)]),
      valor: new FormControl(item?.valor ?? 0, [Validators.required, Validators.min(0.01)]),
    });
  }

  adicionarItem(item?: OrdemCompraItem): void {
    this.itens.push(this.criarItemForm(item));
  }

  removerItem(index: number): void {
    if (this.itens.length === 1) {
      return;
    }

    this.itens.removeAt(index);
  }

  // Lista filtrada do autocomplete de UMA linha: filtra pelo texto digitado
  // nela e esconde materiais já escolhidos nas outras linhas.
  materiaisDoItem(index: number): Material[] {
    const valor = this.itens.at(index)?.get('material')?.value as string | Material | null;
    const termo = (typeof valor === 'string' ? valor : '').trim().toLowerCase();

    const idsEmUso = new Set<number>(
      this.itens.controls
        .filter((_, i) => i !== index)
        .map((g) => g.get('material')?.value?.id)
        .filter((id) => id != null),
    );

    return this.materiais().filter(
      (m) =>
        !idsEmUso.has(m.id) &&
        (m.nome.toLowerCase().includes(termo) || m.equipamento?.toLowerCase().includes(termo)),
    );
  }

  compararFornecedores = (a: Fornecedor | null, b: Fornecedor | null) => a?.id === b?.id;

  displayMaterial(material: Material): string {
    return material ? `${material.nome} (${material.equipamento})` : '';
  }

  selecionarMaterial(index: number, material: Material): void {
    this.itens.at(index).patchValue({
      material,
      valor: Number(material.ultimoValor ?? 0),
    });
  }

  calcularTotal(): number {
    return this.itens.controls.reduce((total, grupo) => {
      const { quantidade, valor } = grupo.getRawValue();
      return total + (Number(quantidade) || 0) * (Number(valor) || 0);
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
      fornecedorCodigo: dados.fornecedor.id,
      dataEntrega: dados.dataEntrega,
      itens: dados.itens.map(
        (item: { material: Material; quantidade: string | number; valor: string | number }) => ({
          material_id: item.material.id,
          quantidade: Number(item.quantidade),
          valor: Number(item.valor),
        }),
      ),
    };

    this.salvar.emit(payload);
  }

  buscarFornecedores() {
    this.fornecedorService.listAll().subscribe({
      next: (res) => this.fornecedores.set(res),
      error: (err) => {
        this.snackBar.open('Erro ao buscar fornecedores', '', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        console.error(err);
      },
    });
  }

  toggleAdicionandoFornecedor() {
    this.isAddingFornecedor.set(!this.isAddingFornecedor());
    if (this.isAddingFornecedor()) {
      this.ordemForm.disable();
    } else {
      this.ordemForm.enable();
    }
  }

  buscarMateriais() {
    this.materialService.listAll().subscribe({
      next: (val) => this.materiais.set(val),
      error: (err) => {
        this.snackBar.open('Erro ao buscar materiais', '', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        console.error(err);
      },
    });
  }
}