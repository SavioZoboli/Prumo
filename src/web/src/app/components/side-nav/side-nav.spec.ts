import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SideNav } from './side-nav';
import { AuthService } from '../../services/auth.service';

describe('SideNav', () => {
  let component: SideNav;
  let fixture: ComponentFixture<SideNav>;

  let perfilLogado = 'ADMIN';
  const authServiceMock = {
    temPerfil: (perfis?: string[]) => !perfis || perfis.includes(perfilLogado),
  };

  // Rotas do menu montado para o perfil logado, achatando os grupos.
  const rotasVisiveis = (nav: SideNav) =>
    nav['itensVisiveis'].flatMap((item) =>
      item.children ? item.children.map((filho) => filho.route) : [item.route],
    );

  beforeEach(async () => {
    perfilLogado = 'ADMIN';
    await TestBed.configureTestingModule({
      imports: [SideNav],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
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
    const grupo = component['navItems'].find((item) => item.label === 'Estoque de materiais');

    expect(grupo?.children?.map((filho) => filho.route)).toEqual([
      '/materiais/consulta-estoque',
      '/materiais',
      '/movimentacoes',
      '/ordens-compra',
    ]);
  });

  it('deve agrupar as telas de administração', () => {
    const grupo = component['navItems'].find((item) => item.label === 'Administração');

    expect(grupo?.children?.map((filho) => filho.route)).toEqual(['/fabricantes', '/usuarios']);
  });

  it('ADMIN vê todas as telas', () => {
    expect(rotasVisiveis(component)).toContain('/usuarios');
    expect(rotasVisiveis(component)).toContain('/fabricantes');
  });

  it('LIDER e USUARIO não veem Usuários, mas veem Fabricantes', () => {
    for (const perfil of ['LIDER', 'USUARIO']) {
      perfilLogado = perfil;
      const nav = TestBed.createComponent(SideNav).componentInstance;

      expect(rotasVisiveis(nav)).not.toContain('/usuarios');
      expect(rotasVisiveis(nav)).toContain('/fabricantes');
      expect(rotasVisiveis(nav)).toContain('/materiais');
    }
  });

  it('deve iniciar com o grupo fechado e alternar ao clicar', () => {
    const grupo = component['navItems'].find((item) => item.label === 'Estoque de materiais')!;

    expect(component['estaAberto'](grupo)).toBe(false);

    component['alternarGrupo'](grupo);
    expect(component['estaAberto'](grupo)).toBe(true);

    component['alternarGrupo'](grupo);
    expect(component['estaAberto'](grupo)).toBe(false);
  });

  it('não deve ter item de menu com rota e filhos ao mesmo tempo', () => {
    const ambiguos = component['navItems'].filter(
      (item) => item.route && item.children,
    );

    expect(ambiguos).toEqual([]);
  });
});
