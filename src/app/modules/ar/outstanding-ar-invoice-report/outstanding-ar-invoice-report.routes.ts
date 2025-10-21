import { Routes } from '@angular/router';
import { OutstandingARInvoiceReportComponent } from './outstanding-ar-invoice-report.component';

export const routes: Routes = [
  {
    path: '',
    component: OutstandingARInvoiceReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/ar-outstanding-report.component').then((m) => m.ArOutstandingReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
