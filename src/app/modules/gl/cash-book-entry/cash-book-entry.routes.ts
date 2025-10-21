import { Routes } from '@angular/router';
import { CashBookEntryComponent } from './cash-book-entry.component';

export const routes: Routes = [
  {
    path: '',
    component: CashBookEntryComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/cash-book-entry.component').then((m) => m.CashBookEntryComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
