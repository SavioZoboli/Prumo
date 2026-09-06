import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida se a data informada não é anterior à data de hoje.
 * Compara apenas a parte de data (dia/mês/ano), ignorando horário.
 *
 * Retorna o erro `dataAnterior: true` quando a data é inválida.
 */
export function dataNaoAnteriorAHojeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (!valor) {
      return null;
    }

    const data = new Date(valor);

    if (isNaN(data.getTime())) {
      return null;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    data.setHours(0, 0, 0, 0);

    return data.getTime() < hoje.getTime() ? { dataAnterior: true } : null;
  };
}