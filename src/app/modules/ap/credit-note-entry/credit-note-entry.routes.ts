import { Routes } from '@angular/router';
import { CreditNoteEntryComponent } from './credit-note-entry.component';

export const routes: Routes = [
  {
    path: '',
    component: CreditNoteEntryComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/ap-credit-note-page.component').then((m) => m.ApCreditNotePageComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
