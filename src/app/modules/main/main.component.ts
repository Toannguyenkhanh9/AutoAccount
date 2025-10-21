import { Component, OnInit } from '@angular/core';
import { MainService } from './main.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [MainService],
})
export class MainComponent implements OnInit {
  ngOnInit(): void {}
}
