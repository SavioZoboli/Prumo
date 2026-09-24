import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SideNav } from './side-nav';

describe('SideNav', () => {
  let component: SideNav;
  let fixture: ComponentFixture<SideNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNav],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve agrupar as telas de estoque', () => {
    const grupo = component['navItems'].find((item) => item.label === 'Estoque');

    expect(grupo?.children?.map((filho) => filho.route)).toEqual([
      '/materiais',
      '/materiais/consulta-estoque',
      '/relatorio-materiais-minimo',
      '/movimentacoes',
    ]);
  });

  it('deve iniciar com o grupo aberto e alternar ao clicar', () => {
    const grupo = component['navItems'].find((item) => item.label === 'Estoque')!;

    expect(component['estaAberto'](grupo)).toBe(true);

    component['alternarGrupo'](grupo);
    expect(component['estaAberto'](grupo)).toBe(false);

    component['alternarGrupo'](grupo);
    expect(component['estaAberto'](grupo)).toBe(true);
  });

  it('não deve ter item de menu com rota e filhos ao mesmo tempo', () => {
    const ambiguos = component['navItems'].filter(
      (item) => item.route && item.children,
    );

    expect(ambiguos).toEqual([]);
  });
});
