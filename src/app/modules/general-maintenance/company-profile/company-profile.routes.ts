import { Routes } from '@angular/router';
import { CompanyProfileComponent } from './company-profile.component';

export const routes: Routes = [
  {
    path: '',
    component: CompanyProfileComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/company-profile.component').then((m) => m.CompanyProfileComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
