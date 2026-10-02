import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNgxMask } from 'ngx-mask';
import { of } from 'rxjs';

import {
  CadastroOrdemCompra,
  Material,
  OrdemCompraPayload,
} from './cadastro-ordem-compra';
import {
  Fornecedor,
  FornecedorService,
} from '../../../services/fornecedor.service';

describe('CadastroOrdemCompra', () => {
  let component: CadastroOrdemCompra;
  let fixture: ComponentFixture<CadastroOrdemCompra>;

  // Mock utilizado apenas nos testes para não acessar a API real.
  const fornecedorServiceMock = {
    listAll: vi.fn(() => of([] as Fornecedor[])),
    save: vi.fn(),
  };

  const snackBarMock = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    fornecedorServiceMock.listAll.mockReset();
    fornecedorServiceMock.listAll.mockReturnValue(
      of([] as Fornecedor[])
    );

    snackBarMock.open.mockReset();

    await TestBed.configureTestingModule({
      imports: [CadastroOrdemCompra],
      providers: [
        provideNgxMask(),
        {
          provide: FornecedorService,
          useValue: fornecedorServiceMock,
        },
        {
          provide: MatSnackBar,
          useValue: snackBarMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroOrdemCompra);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve utilizar o fornecedor selecionado na ordem de compra', () => {
    const fornecedor: Fornecedor = {
      id: 1,
      nome: 'Fornecedor Teste',
      cnpj: '33000167000101',
      ativo: true,
    };

    // Dados simulados exclusivamente para validar a seleção na ordem de compra.
    const material: Material = {
      codigo: 1,
      nome: 'Material Teste',
      fabricante: 'Fabricante Teste',
      ultimoValor: 10,
    };

    component.adicionarItem();

    component.ordemForm.patchValue({
      fornecedor,
      dataEntrega: new Date(Date.now() + 86400000),
    });

    component.itens.at(0).patchValue({
      material,
      quantidade: 2,
      valor: 10,
    });

    let payloadEmitido: OrdemCompraPayload | undefined;

    component.salvar.subscribe((payload) => {
      payloadEmitido = payload;
    });

    component.salvarOrdem();

    expect(payloadEmitido).toBeDefined();
    expect(payloadEmitido?.fornecedorCodigo).toBe(1);
  });

  it('deve carregar os fornecedores na listagem', () => {
    const fornecedores: Fornecedor[] = [
      {
        id: 1,
        nome: 'Fornecedor Teste',
        cnpj: '33000167000101',
        ativo: true,
      },
    ];

    fornecedorServiceMock.listAll.mockReturnValue(
      of(fornecedores)
    );

    component.buscarFornecedores();

    expect(
      fornecedorServiceMock.listAll
    ).toHaveBeenCalled();

    expect(component.fornecedores()).toEqual(
      fornecedores
    );
  });
});