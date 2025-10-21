import { Routes } from '@angular/router';
import { InvoiceEntryComponent } from './invoice-entry.component';

export const routes: Routes = [
  {
    path: '',
    component: InvoiceEntryComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/ar-invoice-page.component').then((m) => m.ArInvoicePageComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
