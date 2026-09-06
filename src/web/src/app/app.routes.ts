import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Usuarios } from './pages/usuarios/usuarios';
import { MainLayout } from './components/main-layout/main-layout';
import { ListaOrdemCompra } from './pages/ordem-compra/lista-ordem-compra/lista-ordem-compra';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component:MainLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'usuarios', component: Usuarios },
      {path:'ordens-compra',component:ListaOrdemCompra}
    ],
  },
];
