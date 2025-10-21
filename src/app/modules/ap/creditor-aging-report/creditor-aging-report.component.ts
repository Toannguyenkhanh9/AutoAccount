import { Component, OnInit } from '@angular/core';
import { CreditorAgingReportService } from './creditor-aging-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-invoice-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [CreditorAgingReportService],
})
export class CreditorAgingReportComponent implements OnInit {
  ngOnInit(): void {}
}
