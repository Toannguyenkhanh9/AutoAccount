import { Routes } from '@angular/router';
import { CreditorStatementReportComponent } from './creditor-statement-report.component';

export const routes: Routes = [
  {
    path: '',
    component: CreditorStatementReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/creditor-statement-report.component').then((m) => m.CreditorStatementReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
