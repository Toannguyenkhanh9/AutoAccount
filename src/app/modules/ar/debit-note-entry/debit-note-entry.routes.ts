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
          import('./list/ar-debit-note-page.component').then((m) => m.ArDebitNotePageComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
