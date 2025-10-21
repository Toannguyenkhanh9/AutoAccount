import { Routes } from '@angular/router';
import { LedgerReportComponent } from './ledger-report.component';

export const routes: Routes = [
  {
    path: '',
    component: LedgerReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/ledger-report.component').then((m) => m.LedgerReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
