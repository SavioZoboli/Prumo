import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';
import { ThemeToggler } from '../theme-toggler/theme-toggler';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
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
    ThemeToggler,
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
    { label: 'Usuários', icon: 'group', route: '/usuarios' },
    { label: 'Materiais', icon: 'inventory_2', route: '/materiais' },
    { label: 'Movimentações', icon: 'swap_horiz', route: '/movimentacoes' },
    { label: 'Ordens de Compra', icon: 'shopping_cart', route: '/ordens-compra' },
  ];
}