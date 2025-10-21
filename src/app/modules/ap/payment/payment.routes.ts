import { Routes } from '@angular/router';
import { PaymentComponent } from './payment.component';

export const routes: Routes = [
  {
    path: '',
    component: PaymentComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/ap-payment-page.component').then((m) => m.ApPaymentPageComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
