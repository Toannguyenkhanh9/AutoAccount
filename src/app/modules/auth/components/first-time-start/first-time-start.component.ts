import { Component, OnInit } from '@angular/core';
import { FirsTimeSetupService } from './first-time-start.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-first-time-start',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [FirsTimeSetupService],
})
export class FirsTimeSetupComponent implements OnInit {
  ngOnInit(): void {}
}
