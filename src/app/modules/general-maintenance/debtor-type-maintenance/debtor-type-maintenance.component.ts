import { Component, OnInit } from '@angular/core';
import { DebtorTypeMaintenanceService } from './debtor-type-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-debtor-type-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [DebtorTypeMaintenanceService],
})
export class AccountMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
