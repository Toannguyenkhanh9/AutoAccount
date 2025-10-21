import { Routes } from '@angular/router';
import { CurrencyMaintenanceComponent } from './currency-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: CurrencyMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/currency-maintenance.component').then((m) => m.CurrencyMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
