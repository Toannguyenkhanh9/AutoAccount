import { Routes } from '@angular/router';
import { FirsTimeSetupComponent } from './first-time-start.component';

export const routes: Routes = [
  {
    path: '',
    component: FirsTimeSetupComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/first-time-start.component').then((m) => m.FirstTimeStartComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
