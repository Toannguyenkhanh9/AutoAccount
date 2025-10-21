import { Routes } from '@angular/router';
import { OutstandingAPInvoiceReportComponent } from './outstanding-ap-invoice-report.component';

export const routes: Routes = [
  {
    path: '',
    component: OutstandingAPInvoiceReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/ap-outstanding-report.component').then((m) => m.ApOutstandingReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
