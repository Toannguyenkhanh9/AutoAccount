import { Component, OnInit } from '@angular/core';
import { AccountTypeMaintenanceService } from './account-type-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-account-type-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [AccountTypeMaintenanceService],
})
export class AccountTypeMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
