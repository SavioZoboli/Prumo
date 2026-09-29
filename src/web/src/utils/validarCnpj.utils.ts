export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

  if (cnpjLimpo.length !== 14) return false;

  // Rejeita sequências com todos os dígitos iguais (ex: 11111111111111)
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

  const calcularDigito = (base: string, pesos: number[]): number => {
    const soma = base
      .split('')
      .reduce((acc, digito, i) => acc + parseInt(digito) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const base = cnpjLimpo.slice(0, 12);
  const digito1 = calcularDigito(base, pesos1);
  const digito2 = calcularDigito(base + digito1, pesos2);

  return cnpjLimpo === base + digito1.toString() + digito2.toString();
}