import { Routes } from '@angular/router';
import { DebtorMaintenanceComponent } from './debtor-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: DebtorMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/debtor-maintenance.component').then((m) => m.DebtorMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
