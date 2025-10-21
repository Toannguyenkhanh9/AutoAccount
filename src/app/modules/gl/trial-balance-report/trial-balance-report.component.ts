import { Component, OnInit } from '@angular/core';
import { TrialBalanceReportService } from './trial-balance-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-trial-balance-report',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [TrialBalanceReportService],
})
export class TrialBalanceReportComponent implements OnInit {
  ngOnInit(): void {}
}
