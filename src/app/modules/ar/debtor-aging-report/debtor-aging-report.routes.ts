import { Routes } from '@angular/router';
import { DeborAgingReportComponent } from './debtor-aging-report.component';

export const routes: Routes = [
  {
    path: '',
    component: DeborAgingReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/debtor-aging-report.component').then((m) => m.DebtorAgingReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
