import { Component, OnInit } from '@angular/core';
import { ContraEntryService } from './contra-entry.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-contra-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [ContraEntryService],
})
export class ContraEntryComponent implements OnInit {
  ngOnInit(): void {}
}
