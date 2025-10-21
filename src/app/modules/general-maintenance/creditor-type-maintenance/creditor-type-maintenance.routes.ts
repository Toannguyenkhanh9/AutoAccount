import { Routes } from '@angular/router';
import { CreditorTypeMaintenanceComponent } from './creditor-type-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: CreditorTypeMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/creditor-type-maintenance.component').then((m) => m.CreditorTypeMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
