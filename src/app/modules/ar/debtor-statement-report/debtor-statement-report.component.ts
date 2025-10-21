import { Component, OnInit } from '@angular/core';
import { DebtorStatementReportService } from './debtor-statement-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-debtor-statement-report',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [DebtorStatementReportService],
})
export class DebtorStatementReportComponent implements OnInit {
  ngOnInit(): void {}
}
