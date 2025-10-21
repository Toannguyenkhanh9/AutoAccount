import { Component, OnInit } from '@angular/core';
import { BankReconciliationService } from './bank-reconciliation.service'
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-bank-reconciliation',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [BankReconciliationService],
})
export class BankReconciliationComponent implements OnInit {
  ngOnInit(): void {}
}
