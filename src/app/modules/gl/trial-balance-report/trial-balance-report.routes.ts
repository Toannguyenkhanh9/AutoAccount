import { Routes } from '@angular/router';
import { TrialBalanceReportComponent } from './trial-balance-report.component';

export const routes: Routes = [
  {
    path: '',
    component: TrialBalanceReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/trial-balance-report.component').then((m) => m.TrialBalanceReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
