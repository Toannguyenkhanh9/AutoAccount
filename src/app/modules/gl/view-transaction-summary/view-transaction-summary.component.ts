import { Component, OnInit } from '@angular/core';
import { ViewTransactionSummaryService } from './view-transaction-summary.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-view-transaction-summary',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [ViewTransactionSummaryService],
})
export class ViewTransactionSummaryComponent implements OnInit {
  ngOnInit(): void {}
}
