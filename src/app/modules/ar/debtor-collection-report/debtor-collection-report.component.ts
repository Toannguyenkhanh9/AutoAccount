import { Component, OnInit } from '@angular/core';
import { DebtorCollectionReportService } from './debtor-collection-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-debtor-collection-report',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [DebtorCollectionReportService],
})
export class DebtorCollectionReportComponent implements OnInit {
  ngOnInit(): void {}
}
