import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../components/input-component/input-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { ThemeToggler } from "../../components/theme-toggler/theme-toggler";
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, ThemeToggler],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPageComponent {
  loginForm: FormGroup;
  loading = signal(false);
  erroLogin = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
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

    this.loading.set(true);
    this.erroLogin.set(false);

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.authService.salvarToken(res.access_token);
        this.loading.set(false);
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.erroLogin.set(true);
      },
    });
  }

  onForgotPassword(): void {
    // TODO: implementar fluxo de redefinição de senha
  }
}