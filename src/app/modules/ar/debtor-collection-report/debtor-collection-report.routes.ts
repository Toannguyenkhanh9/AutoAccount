import { Routes } from '@angular/router';
import { DebtorCollectionReportComponent } from './debtor-collection-report.component';

export const routes: Routes = [
  {
    path: '',
    component: DebtorCollectionReportComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/debtor-collection-report.component').then((m) => m.DebtorCollectionReportComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
