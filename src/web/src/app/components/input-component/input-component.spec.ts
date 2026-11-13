import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { InputComponent } from './input-component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('deve destacar o campo quando hasError for true', () => {
    component.hasError = true;

    fixture.detectChanges();

    const formField = fixture.debugElement.query(
      By.css('.app-input'),
    );

    expect(
      formField.nativeElement.classList.contains(
        'app-input--error',
      ),
    ).toBe(true);
  });

  it('deve exibir a mensagem de erro informada', () => {
    component.hasError = true;
    component.errorMessage = 'Campo obrigatório';

    fixture.detectChanges();

    const erro = fixture.debugElement.query(
      By.css('.app-input__error'),
    );

    expect(erro).not.toBeNull();
    expect(
      erro.nativeElement.textContent.trim(),
    ).toBe('Campo obrigatório');
  });

  it('não deve exibir mensagem quando o campo não tiver erro', () => {
    component.hasError = false;
    component.errorMessage = 'Campo obrigatório';

    fixture.detectChanges();

    expect(
      fixture.debugElement.query(
        By.css('.app-input__error'),
      ),
    ).toBeNull();
  });
});