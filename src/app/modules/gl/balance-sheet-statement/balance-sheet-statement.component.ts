import { Component, OnInit } from '@angular/core';
import { BalanceSheetStatementService } from './balance-sheet-statement.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-balance-sheet-statement',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [BalanceSheetStatementService],
})
export class BalanceSheetStatementComponent implements OnInit {
  ngOnInit(): void {}
}
