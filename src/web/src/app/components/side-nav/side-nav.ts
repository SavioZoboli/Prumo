import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, Perfil } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  // Sem perfis = visível para todos. Deve bater com o `data.perfis` da rota.
  perfis?: Perfil[];
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    AsyncPipe,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss',
})
export class SideNav {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  sair(): void {
    this.authService.logout().subscribe({
      next: () => this.finalizarSaida(),
      error: () => this.finalizarSaida(),
    });
  }

  private finalizarSaida(): void {
    this.authService.limparToken();
    this.router.navigate(['login']);
  }

  protected readonly isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    {
      label: 'Estoque de materiais',
      icon: 'inventory_2',
      children: [
        { label: 'Consulta', icon: 'search', route: '/materiais/consulta-estoque' },
        { label: 'Materiais', icon: 'category', route: '/materiais' },
        { label: 'Movimentações', icon: 'swap_horiz', route: '/movimentacoes' },
        { label: 'Compras', icon: 'shopping_cart', route: '/ordens-compra' },
      ],
    },
    {
      label: 'Administração',
      icon: 'admin_panel_settings',
      children: [
        { label: 'Fabricantes', icon: 'factory', route: '/fabricantes' },
        { label: 'Usuários', icon: 'group', route: '/usuarios', perfis: ['ADMIN'] },
      ],
    },
  ];

  // Menu do usuário logado: tira o que o perfil não acessa e os grupos que ficaram vazios.
  protected readonly itensVisiveis: NavItem[] = this.navItems
    .filter((item) => this.authService.temPerfil(item.perfis))
    .map((item) =>
      item.children
        ? { ...item, children: item.children.filter((f) => this.authService.temPerfil(f.perfis)) }
        : item,
    )
    .filter((item) => !item.children || item.children.length > 0);

  // Grupos começam fechados; só abrem quando o usuário clica.
  private readonly gruposAbertos = signal<ReadonlySet<string>>(new Set());

  protected estaAberto(grupo: NavItem): boolean {
    return this.gruposAbertos().has(grupo.label);
  }

  protected alternarGrupo(grupo: NavItem): void {
    this.gruposAbertos.update((abertos) => {
      const novo = new Set(abertos);
      novo.has(grupo.label) ? novo.delete(grupo.label) : novo.add(grupo.label);
      return novo;
    });
  }
}