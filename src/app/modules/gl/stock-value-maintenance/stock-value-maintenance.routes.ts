import { Routes } from '@angular/router';
import { StockValueMaintenanceComponent } from './stock-value-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: StockValueMaintenanceComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/stock-value-maintenance.component').then((m) => m.StockValueMaintenanceComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
