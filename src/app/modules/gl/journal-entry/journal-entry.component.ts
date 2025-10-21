import { Component, OnInit } from '@angular/core';
import { JournalEntryService } from './journal-entry.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-journal-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [JournalEntryService],
})
export class JournalEntryComponent implements OnInit {
  ngOnInit(): void {}
}
