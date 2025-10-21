import { Routes } from '@angular/router';
import { ReceivePaymentComponent } from './receive-payment.component';

export const routes: Routes = [
  {
    path: '',
    component: ReceivePaymentComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./list/ar-receive-payment-page.component').then((m) => m.ArReceivePaymentPageComponent),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
