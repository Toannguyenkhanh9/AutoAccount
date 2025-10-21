import { Routes } from '@angular/router';
import { AccountMaintenanceComponent } from './debtor-type-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: AccountMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/debtor-type-maintenance.component').then((m) => m.DebtorTypeMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
