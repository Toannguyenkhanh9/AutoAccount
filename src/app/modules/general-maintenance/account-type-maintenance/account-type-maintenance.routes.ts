import { Routes } from '@angular/router';
import { AccountTypeMaintenanceComponent } from './account-type-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: AccountTypeMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/account-type-maintenance.component').then((m) => m.AccountTypeMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
