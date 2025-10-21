import { Routes } from '@angular/router';
import { BalanceSheetStatementComponent } from './balance-sheet-statement.component';

export const routes: Routes = [
  {
    path: '',
    component: BalanceSheetStatementComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/balance-sheet.component').then((m) => m.BalanceSheetComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
