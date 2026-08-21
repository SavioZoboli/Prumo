import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},
    {path:'login',component:LoginPageComponent},
    {path:'dashboard',component:Dashboard}
];
