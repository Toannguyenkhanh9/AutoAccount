import { Component, OnInit } from '@angular/core';
import { LastYearBalanceMaintenanceService } from './last-year-balance-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-last-year-balance-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [LastYearBalanceMaintenanceService],
})
export class LastYearBalanceMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
