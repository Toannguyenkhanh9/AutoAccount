import { Component, OnInit } from '@angular/core';
import { JournalTypeMaintenanceService } from './journal-type-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-journal-type-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [JournalTypeMaintenanceService],
})
export class JournalTypeMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
