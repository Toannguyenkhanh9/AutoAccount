import { Component, OnInit } from '@angular/core';
import { ManageAccountBookService } from './manage-account-book.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-contra-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [ManageAccountBookService],
})
export class ManageAccountBookComponent implements OnInit {
  ngOnInit(): void {}
}
