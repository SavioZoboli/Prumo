import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroFornecedor } from './cadastro-fornecedor';

describe('CadastroFornecedor', () => {
  let component: CadastroFornecedor;
  let fixture: ComponentFixture<CadastroFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroFornecedor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
