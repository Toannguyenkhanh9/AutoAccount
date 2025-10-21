import { Routes } from '@angular/router';
import { LastYearBalanceMaintenanceComponent } from './last-year-balance-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: LastYearBalanceMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/last-year-balance-maintenance.component').then((m) => m.LastYearBalanceMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
