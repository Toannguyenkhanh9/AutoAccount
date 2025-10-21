import { Component, OnInit } from '@angular/core';
import { LedgerReportService } from './ledger-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-ledger-report',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [LedgerReportService],
})
export class LedgerReportComponent implements OnInit {
  ngOnInit(): void {}
}
