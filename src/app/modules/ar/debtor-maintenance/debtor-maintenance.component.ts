import { Component, OnInit } from '@angular/core';
import { DebtorMaintenanceService } from './debtor-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-debtor-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [DebtorMaintenanceService],
})
export class DebtorMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
