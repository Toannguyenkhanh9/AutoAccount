import { Component, OnInit } from '@angular/core';
import { DeborAgingReportService } from './debtor-aging-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-debtor-aging-report',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [DeborAgingReportService],
})
export class DeborAgingReportComponent implements OnInit {
  ngOnInit(): void {}
}
