import { Component, OnInit } from '@angular/core';
import { AccountMaintenanceService } from './account-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-account-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [AccountMaintenanceService],
})
export class AccountMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
