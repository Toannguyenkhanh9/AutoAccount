import { Routes } from '@angular/router';
import { ContraEntryComponent } from './contra-entry.component';

export const routes: Routes = [
  {
    path: '',
    component: ContraEntryComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/ar-ap-contra-page.component').then((m) => m.ArApContraPageComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
