import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Usuarios } from './pages/usuarios/usuarios';
import { Materiais } from './pages/materiais/materiais';
import { RelatorioMateriaisMinimo } from './pages/relatorio-materiais-minimo/relatorio-materiais-minimo';
import { ListaMovimentacoes } from './pages/movimentacoes/lista-movimentacoes/lista-movimentacoes';
import { MainLayout } from './components/main-layout/main-layout';
import { ListaOrdemCompra } from './pages/ordem-compra/lista-ordem-compra/lista-ordem-compra';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'usuarios', component: Usuarios },
      { path: 'materiais', component: Materiais },
      { path: 'relatorio-materiais-minimo', component: RelatorioMateriaisMinimo },
      { path: 'movimentacoes', component: ListaMovimentacoes },
      { path: 'ordens-compra', component: ListaOrdemCompra },
    ],
  },
];