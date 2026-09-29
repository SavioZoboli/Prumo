import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { EstornoDialog } from './estorno-dialog';

describe('EstornoDialog', () => {
  let component: EstornoDialog;
  let fixture: ComponentFixture<EstornoDialog>;
  let closeSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    closeSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [EstornoDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { movimentacaoId: 1 } },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EstornoDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('não deve fechar o dialog se o motivo estiver vazio', () => {
    component.confirmar();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(component.motivo.touched).toBe(true);
  });

  it('deve fechar o dialog com o motivo informado', () => {
    component.motivo.setValue('Lançamento feito por engano');

    component.confirmar();

    expect(closeSpy).toHaveBeenCalledWith('Lançamento feito por engano');
  });

  it('deve fechar o dialog com null ao cancelar', () => {
    component.cancelar();

    expect(closeSpy).toHaveBeenCalledWith(null);
  });
});
