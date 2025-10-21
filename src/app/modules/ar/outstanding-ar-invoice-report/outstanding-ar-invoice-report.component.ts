import { Component, OnInit } from '@angular/core';
import { OutstandingARInvoiceReportService } from './outstanding-ar-invoice-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-outstanding-ar-invoice-report',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [OutstandingARInvoiceReportService],
})
export class OutstandingARInvoiceReportComponent implements OnInit {
  ngOnInit(): void {}
}
