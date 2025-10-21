import { Component, OnInit } from '@angular/core';
import { StockValueMaintenanceService } from './stock-value-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-stock-value-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [StockValueMaintenanceService],
})
export class StockValueMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
