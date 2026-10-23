import {
  classificarEstoque,
  classificarFalta,
  faixaDoStatus,
  hojeNoFuso,
  inicioDaSemana,
  inicioDoMesSeguinte,
  semanasAte,
} from './dashboard.regras';

describe('Regras do dashboard', () => {
  describe('classificarEstoque', () => {
    it('considera "no mínimo" como abaixo do mínimo, igual ao alerta por e-mail', () => {
      expect(classificarEstoque(100, 100)).toBe('ABAIXO_MINIMO');
      expect(classificarEstoque(10, 100)).toBe('ABAIXO_MINIMO');
    });

    it('marca atenção até 20% acima do mínimo', () => {
      expect(classificarEstoque(101, 100)).toBe('EM_ATENCAO');
      expect(classificarEstoque(120, 100)).toBe('EM_ATENCAO');
      expect(classificarEstoque(121, 100)).toBe('OK');
    });

    it('com mínimo zero, só estoque zerado é crítico', () => {
      expect(classificarEstoque(0, 0)).toBe('ABAIXO_MINIMO');
      expect(classificarEstoque(1, 0)).toBe('OK');
    });
  });

  describe('classificarFalta', () => {
    it('separa "acabou" de "está acabando"', () => {
      expect(classificarFalta(0)).toBe('SEM_ESTOQUE');
      expect(classificarFalta(3)).toBe('ABAIXO_MINIMO');
    });
  });

  describe('faixaDoStatus', () => {
    // Cada material crítico cai em exatamente uma das faixas filtradas.
    const dentro = (
      atual: number,
      minimo: number,
      status?: 'ABAIXO_MINIMO' | 'EM_ATENCAO',
    ) => {
      const { ate, acimaDoMinimo } = faixaDoStatus(status);
      return atual <= minimo * ate && (!acimaDoMinimo || atual > minimo);
    };

    it.each([
      [100, 100, 'ABAIXO_MINIMO'],
      [0, 100, 'ABAIXO_MINIMO'],
      [101, 100, 'EM_ATENCAO'],
      [120, 100, 'EM_ATENCAO'],
    ] as const)('%i/%i entra só em %s', (atual, minimo, esperado) => {
      expect(classificarEstoque(atual, minimo)).toBe(esperado);
      expect(dentro(atual, minimo, 'ABAIXO_MINIMO')).toBe(
        esperado === 'ABAIXO_MINIMO',
      );
      expect(dentro(atual, minimo, 'EM_ATENCAO')).toBe(
        esperado === 'EM_ATENCAO',
      );
      expect(dentro(atual, minimo)).toBe(true);
    });

    it('sem filtro, quem está OK fica de fora', () => {
      expect(dentro(121, 100)).toBe(false);
    });
  });

  describe('hojeNoFuso', () => {
    it('usa o dia de São Paulo, não o de UTC', () => {
      // 01:00 UTC do dia 7 ainda é 22:00 do dia 6 em São Paulo.
      expect(hojeNoFuso(new Date('2026-10-07T01:00:00Z'))).toBe('2026-10-06');
    });
  });

  describe('semanas', () => {
    it('a semana começa na segunda-feira', () => {
      expect(inicioDaSemana('2026-10-06')).toBe('2026-10-05'); // terça
      expect(inicioDaSemana('2026-10-05')).toBe('2026-10-05'); // segunda
      expect(inicioDaSemana('2026-10-11')).toBe('2026-10-05'); // domingo
    });

    it('monta as últimas 6 semanas como no protótipo', () => {
      expect(semanasAte('2026-10-06', 6)).toEqual([
        { inicio: '2026-08-31', fim: '2026-09-06' },
        { inicio: '2026-09-07', fim: '2026-09-13' },
        { inicio: '2026-09-14', fim: '2026-09-20' },
        { inicio: '2026-09-21', fim: '2026-09-27' },
        { inicio: '2026-09-28', fim: '2026-10-04' },
        { inicio: '2026-10-05', fim: '2026-10-11' },
      ]);
    });
  });

  describe('inicioDoMesSeguinte', () => {
    it('vira o ano em dezembro', () => {
      expect(inicioDoMesSeguinte('2026-10')).toBe('2026-11-01');
      expect(inicioDoMesSeguinte('2026-12')).toBe('2027-01-01');
    });
  });
});
