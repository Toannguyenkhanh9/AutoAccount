import { Routes } from '@angular/router';
import { ProfitAndLossStatementComponent } from './profit-and-loss-statement.component';

export const routes: Routes = [
  {
    path: '',
    component: ProfitAndLossStatementComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/profit-and-loss.component').then((m) => m.ProfitAndLossComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
