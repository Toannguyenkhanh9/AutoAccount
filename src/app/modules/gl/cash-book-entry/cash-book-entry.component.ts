import { Component, OnInit } from '@angular/core';
import { CashBookEntryService } from './cash-book-entry.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cash-book-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [CashBookEntryService],
})
export class CashBookEntryComponent implements OnInit {
  ngOnInit(): void {}
}
