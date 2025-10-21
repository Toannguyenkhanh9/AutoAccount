import { Component, OnInit } from '@angular/core';
import { CreditorTypeMaintenanceService } from './creditor-type-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-creditor-type-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [CreditorTypeMaintenanceService],
})
export class CreditorTypeMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
