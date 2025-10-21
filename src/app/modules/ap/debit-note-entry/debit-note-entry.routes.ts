import { Routes } from '@angular/router';
import { DebitNoteEntryComponent } from './debit-note-entry.component';

export const routes: Routes = [
  {
    path: '',
    component: DebitNoteEntryComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/ap-debit-note-page.component').then((m) => m.ApDebitNotePageComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
