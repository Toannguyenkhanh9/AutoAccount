import { Component, OnInit } from '@angular/core';
import { OpeningBalanceMaintenanceService } from './opening-balance-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-journal-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [OpeningBalanceMaintenanceService],
})
export class OpeningBalanceMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
