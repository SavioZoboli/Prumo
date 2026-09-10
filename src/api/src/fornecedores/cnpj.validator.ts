import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function isCnpjValido(cnpj: unknown): boolean {
  if (typeof cnpj !== 'string') return false;

  const digitos = cnpj.replace(/\D/g, '');
  if (digitos.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digitos)) return false;

  const calcularDigito = (base: string, pesos: number[]): number => {
    const soma = base
      .split('')
      .reduce((acc, char, i) => acc + Number(char) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const base12 = digitos.slice(0, 12);
  const digito1 = calcularDigito(base12, pesos1);
  const digito2 = calcularDigito(base12 + digito1, pesos2);

  return digitos === `${base12}${digito1}${digito2}`;
}

export function IsCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCnpj',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isCnpjValido(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser um CNPJ válido`;
        },
      },
    });
  };
}

export function normalizarCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}
