import { Routes } from '@angular/router';
import { JournalOfTransactionReportComponent } from './journal-of-transaction-report.component';

export const routes: Routes = [
  {
    path: '',
    component: JournalOfTransactionReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/journal-of-transaction-report.component').then((m) => m.JournalOfTransactionReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
