import { Routes } from '@angular/router';
import { OpeningBalanceMaintenanceComponent } from './opening-balance-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: OpeningBalanceMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/opening-balance-maintenance.component').then((m) => m.OpeningBalanceMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
