import { Component, OnInit } from '@angular/core';
import { CurrencyMaintenanceService } from './currency-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-currency-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [CurrencyMaintenanceService],
})
export class CurrencyMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
