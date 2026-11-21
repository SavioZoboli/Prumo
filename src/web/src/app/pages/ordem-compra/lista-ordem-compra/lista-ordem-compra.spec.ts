import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';

import { ListaOrdemCompra } from './lista-ordem-compra';
import { OrdemCompraLista } from '../cadastro-ordem-compra/cadastro-ordem-compra';

describe('ListaOrdemCompra', () => {
  let component: ListaOrdemCompra;
  let fixture: ComponentFixture<ListaOrdemCompra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaOrdemCompra]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaOrdemCompra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve paginar as ordens de 10 em 10 por padrão', () => {
    const ordens = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }) as OrdemCompraLista);
    component.ordens.set(ordens);

    expect(component.ordensPaginadas().map((o) => o.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 12 });
    expect(component.ordensPaginadas().map((o) => o.id)).toEqual([11, 12]);
  });

  // Bug 07: duplo clique em "Receber ordem de compra".
  describe('ao receber uma ordem', () => {
    const ordem = { id: 7 } as OrdemCompraLista;

    it('envia uma única requisição mesmo com dois cliques antes da resposta', () => {
      const resposta = new Subject<void>();
      const receber = vi.spyOn(component['ordemCompraService'], 'receber').mockReturnValue(resposta.asObservable());

      component.finalizar(ordem);
      component.finalizar(ordem);

      expect(receber).toHaveBeenCalledTimes(1);
      expect(component.recebendo().has(7)).toBe(true);

      resposta.error({ error: { message: 'Esta ordem de compra já foi recebida.' } });
      expect(component.recebendo().has(7)).toBe(false);
    });

    it('mostra a mensagem da API com estilo de erro', () => {
      vi.spyOn(component['ordemCompraService'], 'receber').mockReturnValue(
        throwError(() => ({ error: { message: 'Esta ordem de compra já foi recebida.' } })),
      );
      const snackBar = vi.spyOn(component['snackBar'], 'open');

      component.finalizar(ordem);

      expect(snackBar).toHaveBeenCalledWith(
        'Esta ordem de compra já foi recebida.',
        'Fechar',
        expect.objectContaining({ panelClass: ['error-snackbar'] }),
      );
    });
  });
});
