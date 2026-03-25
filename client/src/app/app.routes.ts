import { Routes } from '@angular/router';
import { authGuard } from './services/auth-guard';
import { MainLayout } from './mainlayout';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [

            { path: '', loadComponent: () => import('./pages/homepage').then(m => m.Homepage), pathMatch: 'full' },
            { path: 'animes', loadComponent: () => import('./pages/animes').then(m => m.Animes), canActivate: [authGuard], },
            { path: 'my-animes', loadComponent: () => import('./pages/my-animes').then(m => m.MyAnimes), canActivate: [authGuard], },
            { path: 'login', loadComponent: () => import('./pages/login').then(m => m.Login) },
            { path: 'register', loadComponent: () => import('./pages/register').then(m => m.Register) },
            {
                path: '**', loadComponent() {
                    return import('./pages/not-found').then(m => m.NotFound);
                }
            }
        ],
    },

];
