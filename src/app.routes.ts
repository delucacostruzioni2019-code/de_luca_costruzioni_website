import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home').then(m => m.default) },
    { path: 'homepage', loadComponent: () => import('./pages/home/home').then(m => m.default) },
    { path: 'agency', loadComponent: () => import('./pages/agency/agency').then(m => m.default) },
    { path: 'services', loadComponent: () => import('./pages/services/services').then(m => m.default) },
    { path: 'portfolio', loadComponent: () => import('./pages/portfolio/portfolio').then(m => m.default) },
    { path: 'portfolio/:id', loadComponent: () => import('./pages/portfolio-detail/portfolio-detail').then(m => m.default) },
    { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.default) },
    { path: 'free_estimate', loadComponent: () => import('./pages/free-estimate/free-estimate').then(m => m.default) },
    { path: 'privacy-policy', loadComponent: () => import('./components/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy) },
    {
        path: 'admin', loadComponent: () => import('./pages/admin/admin').then(m => m.default), children: [
            { path: 'login', loadComponent: () => import('./pages/admin/login/login').then(m => m.default) },
            { path: '', loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.default), canActivate: [authGuard], },
            { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.default), canActivate: [authGuard], },
            { path: 'ristrutturazioni', loadComponent: () => import('./pages/admin/ristrutturazioni/ristrutturazioni').then(m => m.default), canActivate: [authGuard] },
            { path: 'lead', loadComponent: () => import('./pages/admin/lead/lead-list').then(m => m.default), canActivate: [authGuard] },
            { path: 'fornitori', loadComponent: () => import('./pages/admin/fornitori/fornitori').then(m => m.default), canActivate: [authGuard] },
            { path: 'fornitori/create', loadComponent: () => import('./pages/admin/fornitori/create/create-fornitore').then(m => m.default), canActivate: [authGuard] },
            { path: 'fornitori/edit/:id', loadComponent: () => import('./pages/admin/fornitori/edit/edit-fornitore').then(m => m.default), canActivate: [authGuard] },
            { path: 'materiali', loadComponent: () => import('./pages/admin/materiali/materiali').then(m => m.default), canActivate: [authGuard] },
            { path: 'materiali/create', loadComponent: () => import('./pages/admin/materiali/create/create-materiale').then(m => m.default), canActivate: [authGuard] },
            { path: 'materiali/edit/:id', loadComponent: () => import('./pages/admin/materiali/edit/edit-materiale').then(m => m.default), canActivate: [authGuard] },
            { path: 'cantieri', loadComponent: () => import('./pages/admin/cantieri/cantieri').then(m => m.default), canActivate: [authGuard] },
            { path: 'cantieri/create', loadComponent: () => import('./pages/admin/cantieri/create/create-cantiere').then(m => m.default), canActivate: [authGuard] },
            { path: 'cantieri/edit/:id', loadComponent: () => import('./pages/admin/cantieri/edit/edit-cantiere').then(m => m.default), canActivate: [authGuard] },
            { path: 'ddt', loadComponent: () => import('./pages/admin/ddt/ddt').then(m => m.default), canActivate: [authGuard] },
            { path: 'ddt/create', loadComponent: () => import('./pages/admin/ddt/create/create-ddt').then(m => m.default), canActivate: [authGuard] },
            { path: 'ddt/edit/:id', loadComponent: () => import('./pages/admin/ddt/edit/edit-ddt').then(m => m.default), canActivate: [authGuard] },
        ]
    },
]


