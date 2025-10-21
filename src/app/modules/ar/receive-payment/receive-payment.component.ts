import { Component, OnInit } from '@angular/core';
import { ReceivePaymentService } from './receive-payment.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-receive-payment',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [ReceivePaymentService],
})
export class ReceivePaymentComponent implements OnInit {
  ngOnInit(): void {}
}
