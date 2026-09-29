import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaOrdemCompra } from './lista-ordem-compra';

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
});
