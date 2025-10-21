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
          import('./list/ap-invoice-page.component').then((m) => m.ApInvoicePageComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
