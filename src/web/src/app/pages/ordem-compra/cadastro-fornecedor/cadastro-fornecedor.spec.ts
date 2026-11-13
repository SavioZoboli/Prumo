import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxMask } from 'ngx-mask';
import { of, throwError } from 'rxjs';

import { CadastroFornecedor } from './cadastro-fornecedor';
import { FornecedorService } from '../../../services/fornecedor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

describe('CadastroFornecedor', () => {
  let component: CadastroFornecedor;
  let fixture: ComponentFixture<CadastroFornecedor>;

  const fornecedorServiceMock = {
    save: vi.fn(),
  };

  const snackBarMock = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    fornecedorServiceMock.save.mockReset();
    snackBarMock.open.mockReset();

    await TestBed.configureTestingModule({
      imports: [CadastroFornecedor],
      providers: [
        provideNgxMask(),
        { provide: FornecedorService, useValue: fornecedorServiceMock },
      ],
    });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBarMock });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(CadastroFornecedor);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com o formulário inválido', () => {
    expect(component.formFornecedor.invalid).toBe(true);
  });

  it('deve rejeitar CNPJ inválido', () => {
    component.formFornecedor.patchValue({
      nome: 'Fornecedor Teste',
      cnpj: '12345678000190',
    });

    expect(component.formCNPJ.invalid).toBe(true);
    expect(component.formCNPJ.hasError('cnpjInvalido')).toBe(true);
  });

  it('deve salvar um fornecedor válido', () => {
    fornecedorServiceMock.save.mockReturnValue(of(void 0));

    component.formFornecedor.patchValue({
      nome: 'Fornecedor Teste',
      cnpj: '33000167000101',
    });

    const emitSpy = vi.spyOn(component.cadastrado, 'emit');

    component.salvarFornecedor();

    expect(fornecedorServiceMock.save).toHaveBeenCalledWith(
      'Fornecedor Teste',
      '33000167000101'
    );

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Fornecedor salvo com sucesso',
      '',
      {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      }
    );

    expect(emitSpy).toHaveBeenCalled();
  });

  it('deve exibir erro quando não conseguir salvar', () => {
    fornecedorServiceMock.save.mockReturnValue(
      throwError(() => new Error('Erro'))
    );

    component.formFornecedor.patchValue({
      nome: 'Fornecedor Teste',
      cnpj: '33000167000101',
    });

    component.salvarFornecedor();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Erro ao salvar fornecedor',
      '',
      {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      }
    );
  });

  // Bug 07: duplo clique em Salvar e mensagem de erro do cadastro de fornecedor.
  it('envia uma única requisição mesmo com dois cliques antes da resposta', () => {
    const resposta = new Subject<unknown>();
    fornecedorServiceMock.save.mockReturnValue(resposta.asObservable());
    component.formFornecedor.patchValue({ nome: 'Fornecedor Teste', cnpj: '33000167000101' });

    component.salvarFornecedor();
    component.salvarFornecedor();

    expect(fornecedorServiceMock.save).toHaveBeenCalledTimes(1);
    expect(component.salvando()).toBe(true);

    resposta.next({});
    resposta.complete();
    expect(component.salvando()).toBe(false);
  });

  it('desabilita o botão Salvar durante o envio', () => {
    fornecedorServiceMock.save.mockReturnValue(new Subject<unknown>().asObservable());
    component.formFornecedor.patchValue({ nome: 'Fornecedor Teste', cnpj: '33000167000101' });

    component.salvarFornecedor();
    fixture.detectChanges();

    const botao: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(botao.disabled).toBe(true);
  });

  it('mostra a mensagem da API quando o CNPJ já está cadastrado', () => {
    fornecedorServiceMock.save.mockReturnValue(
      throwError(() => ({ error: { message: 'Fornecedor já cadastrado.' } })),
    );
    component.formFornecedor.patchValue({ nome: 'Fornecedor Teste', cnpj: '33000167000101' });

    component.salvarFornecedor();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Fornecedor já cadastrado.',
      '',
      expect.objectContaining({ panelClass: ['error-snackbar'] }),
    );
    expect(component.salvando()).toBe(false);
  });
});