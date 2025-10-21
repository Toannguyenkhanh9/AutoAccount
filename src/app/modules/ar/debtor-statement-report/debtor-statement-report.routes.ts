import { Routes } from '@angular/router';
import { DebtorStatementReportComponent } from './debtor-statement-report.component';

export const routes: Routes = [
  {
    path: '',
    component: DebtorStatementReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/debtor-statement-report.component').then((m) => m.DebtorStatementReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
