import { Component, OnInit } from '@angular/core';
import { ProfitAndLossStatementService } from './profit-and-loss-statement.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profit-and-loss',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [ProfitAndLossStatementService],
})
export class ProfitAndLossStatementComponent implements OnInit {
  ngOnInit(): void {}
}
