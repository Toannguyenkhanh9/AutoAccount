import { Routes } from '@angular/router';
import { DocumentNumberingFormatMaintenanceComponent } from './document-numbering-format-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: DocumentNumberingFormatMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/document-numbering-format.component').then((m) => m.DocumentNumberingFormatProComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
