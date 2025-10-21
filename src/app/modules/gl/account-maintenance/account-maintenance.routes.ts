import { Routes } from '@angular/router';
import { AccountMaintenanceComponent } from './account-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: AccountMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/account-maintenance.component').then((m) => m.AccountMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
