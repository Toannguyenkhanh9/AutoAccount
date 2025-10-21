import { Component, OnInit } from '@angular/core';
import { JournalOfTransactionReportService } from './journal-of-transaction-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-ledger-report',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [JournalOfTransactionReportService],
})
export class JournalOfTransactionReportComponent implements OnInit {
  ngOnInit(): void {}
}
