import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroOrdemCompra } from './cadastro-ordem-compra';

describe('CadastroOrdemCompra', () => {
  let component: CadastroOrdemCompra;
  let fixture: ComponentFixture<CadastroOrdemCompra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroOrdemCompra]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroOrdemCompra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
