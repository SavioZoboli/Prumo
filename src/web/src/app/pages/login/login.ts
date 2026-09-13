import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../components/input-component/input-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { ThemeToggler } from "../../components/theme-toggler/theme-toggler";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, ThemeToggler],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPageComponent {
  loginForm: FormGroup;
  loading = false;


  constructor(private fb: FormBuilder,private router:Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    console.log('Login payload:', this.loginForm.value);
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['dashboard'])
    }, 1000);
    
  }

  onForgotPassword(): void {
    // TODO: implementar fluxo de redefinição de senha
  }
}