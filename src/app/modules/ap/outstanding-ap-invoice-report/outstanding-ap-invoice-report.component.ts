import { Component, OnInit } from '@angular/core';
import { OutstandingAPInvoiceReportService } from './outstanding-ap-invoice-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-outstanding-ap-invoice-report',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [OutstandingAPInvoiceReportService],
})
export class OutstandingAPInvoiceReportComponent implements OnInit {
  ngOnInit(): void {}
}
