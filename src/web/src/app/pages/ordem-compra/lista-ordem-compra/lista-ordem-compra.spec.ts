import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
