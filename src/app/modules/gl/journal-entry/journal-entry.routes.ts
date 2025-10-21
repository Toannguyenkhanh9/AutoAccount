import { Routes } from '@angular/router';
import { JournalEntryComponent } from './journal-entry.component';

export const routes: Routes = [
  {
    path: '',
    component: JournalEntryComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/journal-entry.component').then((m) => m.JournalEntryComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
