import { Component, OnInit } from '@angular/core';
import { CreditorMaintenanceService } from './creditor-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-creditor-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [CreditorMaintenanceService],
})
export class CreditorMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
