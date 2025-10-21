import { Routes } from '@angular/router';
import { CreditorAgingReportComponent } from './creditor-aging-report.component';

export const routes: Routes = [
  {
    path: '',
    component: CreditorAgingReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/creditor-aging-report.component').then((m) => m.CreditorAgingReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
