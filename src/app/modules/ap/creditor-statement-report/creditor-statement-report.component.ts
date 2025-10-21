import { Component, OnInit } from '@angular/core';
import { CreditorStatementReportService } from './creditor-statement-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-debit-note-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [CreditorStatementReportService],
})
export class CreditorStatementReportComponent implements OnInit {
  ngOnInit(): void {}
}
