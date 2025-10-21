import { Routes } from '@angular/router';
import { JournalTypeMaintenanceComponent } from './journal-type-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: JournalTypeMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/journal-type-maintenance.component').then((m) => m.JournalTypeMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
