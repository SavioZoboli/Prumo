import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';

export type InputIcon = 'user' | 'lock' | null;
export type InputType = 'text' | 'number' | 'password' | 'email';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatAutocompleteModule],
  templateUrl: './input-component.html',
  styleUrl: './input-component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: InputType = 'text';
  @Input() required = false;
  @Input() icon: InputIcon = null;
  @Input() errorMessage = '';
  @Input() hasError = false;

  // Painel de um <mat-autocomplete> declarado pelo componente pai (sibling do app-input).
  @Input() autocompletePanel: MatAutocomplete | null = null;

  // Necessário quando o valor do control é um objeto (ex: material selecionado no
  // autocomplete): formata o objeto para texto exibido no input.
  @Input() displayWith: ((value: any) => string) | null = null;

  value = '';
  disabled = false;

  // Mapeia o ícone semântico do componente para o nome do Material Symbols/Icons
  get matIconName(): string {
    return this.icon === 'user' ? 'person' : 'lock';
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.value = this.displayWith ? this.displayWith(value) : ((value as string) ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(target.value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}