import { Routes } from '@angular/router';
import { ManageAccountBookComponent } from './manage-account-book.component';

export const routes: Routes = [
  {
    path: '',
    component: ManageAccountBookComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/manage-account-book.component').then((m) => m.ManageAccountBookComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
