import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoginPageComponent } from './login';
import { InputComponent } from '../../components/input-component/input-component';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve marcar os campos inválidos ao tentar entrar com formulário vazio', () => {
    const formulario = fixture.debugElement.query(
      By.css('form'),
    );

    formulario.triggerEventHandler('ngSubmit', null);
    fixture.detectChanges();

    expect(component.email?.touched).toBe(true);
    expect(component.password?.touched).toBe(true);
    expect(component.email?.invalid).toBe(true);
    expect(component.password?.invalid).toBe(true);
  });

  it('deve exibir mensagens de validação ao tentar entrar com campos vazios', () => {
    const formulario = fixture.debugElement.query(
      By.css('form'),
    );

    formulario.triggerEventHandler('ngSubmit', null);
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(
      By.directive(InputComponent),
    );

    expect(inputs.length).toBe(2);

    const emailInput = inputs[0];
    const senhaInput = inputs[1];

    expect(
      emailInput.componentInstance.hasError,
    ).toBe(true);

    expect(
      senhaInput.componentInstance.hasError,
    ).toBe(true);

    const erroEmail = emailInput.query(
      By.css('.app-input__error'),
    );

    const erroSenha = senhaInput.query(
      By.css('.app-input__error'),
    );

    expect(erroEmail).not.toBeNull();
    expect(
      erroEmail.nativeElement.textContent.trim(),
    ).toBe('Informe um e-mail válido');

    expect(erroSenha).not.toBeNull();
    expect(
      erroSenha.nativeElement.textContent.trim(),
    ).toBe('Senha é obrigatória');
  });

  it('deve destacar os campos inválidos ao tentar entrar com formulário vazio', () => {
    const formulario = fixture.debugElement.query(
      By.css('form'),
    );

    formulario.triggerEventHandler('ngSubmit', null);
    fixture.detectChanges();

    const camposComErro = fixture.debugElement.queryAll(
      By.css('.app-input--error'),
    );

    expect(camposComErro.length).toBe(2);
  });
});