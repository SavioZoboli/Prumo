import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { InputComponent } from '../input-component/input-component';

export interface EstornoDialogData {
  movimentacaoId: number;
}

@Component({
  selector: 'app-estorno-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatButtonModule,
    InputComponent,
  ],
  templateUrl: './estorno-dialog.html',
  styleUrl: './estorno-dialog.scss',
})
export class EstornoDialog {
  data: EstornoDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<EstornoDialog>);

  motivo = new FormControl('', [Validators.required, Validators.maxLength(100)]);

  confirmar(): void {
    if (this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }

    this.dialogRef.close(this.motivo.value!.trim());
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
