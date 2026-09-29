import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { cnpjValidator } from '../../../../utils/validators.utils';
import { FornecedorService } from '../../../services/fornecedor.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cadastro-fornecedor',
  imports: [
    NgxMaskDirective,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './cadastro-fornecedor.html',
  styleUrl: './cadastro-fornecedor.scss',
})
export class CadastroFornecedor {
  @Output() cadastrado = new EventEmitter();

  private fornecedorService = inject(FornecedorService);
  private snackBar = inject(MatSnackBar);

  formFornecedor = new FormGroup({
    nome: new FormControl('', Validators.required),
    cnpj: new FormControl('', [
      Validators.required,
      Validators.minLength(14),
      Validators.maxLength(14),
      cnpjValidator(),
    ]),
  });

  get formNome(): FormControl {
    return this.formFornecedor.get('nome') as FormControl;
  }

  get formCNPJ(): FormControl {
    return this.formFornecedor.get('cnpj') as FormControl;
  }

  salvarFornecedor() {
    let nome = this.formNome.value;
    let cnpj = this.formCNPJ.value;

    this.fornecedorService.save(nome, cnpj).subscribe({
      next: (res) => {
        this.snackBar.open('Fornecedor salvo com sucesso', '', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        this.cadastrado.emit()
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Erro ao salvar fornecedor', '', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
