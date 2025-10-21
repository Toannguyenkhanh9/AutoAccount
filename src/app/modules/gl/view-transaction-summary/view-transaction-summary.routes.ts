import { Routes } from '@angular/router';
import { ViewTransactionSummaryComponent } from './view-transaction-summary.component';

export const routes: Routes = [
  {
    path: '',
    component: ViewTransactionSummaryComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/view-transaction-summary.component').then((m) => m.ViewTransactionSummaryComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
