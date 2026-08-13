import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';

@Component({
  selector: 'app-login',
  imports: [MatFormFieldModule,MatInputModule,ReactiveFormsModule,ThemeToggler],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

}
