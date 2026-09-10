import { Component, inject, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  imports: [MatDialogContent, MatDialogActions,MatButtonModule,MatDialogClose,MatDialogTitle],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {


  data = inject(MAT_DIALOG_DATA);

}
