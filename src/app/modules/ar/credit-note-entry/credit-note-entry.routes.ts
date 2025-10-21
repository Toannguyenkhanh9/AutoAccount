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
          import('./list/ar-credit-note-page.component').then((m) => m.ArCreditNotePageComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
