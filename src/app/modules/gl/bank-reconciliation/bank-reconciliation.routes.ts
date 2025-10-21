import { Routes } from '@angular/router';
import { BankReconciliationComponent } from './bank-reconciliation.component';

export const routes: Routes = [
  {
    path: '',
    component: BankReconciliationComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/bank-reconciliation.component').then((m) => m.BankReconciliationComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
