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
            { path: 'inspections-calendar', loadComponent: () => import('./pages/admin/inspections-calendar/inspections-calendar').then(m => m.default), canActivate: [authGuard] },]
    },
]


