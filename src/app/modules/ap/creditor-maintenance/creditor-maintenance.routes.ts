import { Routes } from '@angular/router';
import { CreditorMaintenanceComponent } from './creditor-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: CreditorMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/creditor-maintenance.component').then((m) => m.CreditorMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
