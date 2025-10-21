import { Component, OnInit } from '@angular/core';
import { PaymentService } from './payment.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-payment',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [PaymentService],
})
export class PaymentComponent implements OnInit {
  ngOnInit(): void {}
}
