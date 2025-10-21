import { Component, OnInit } from '@angular/core';
import { CompanyProfileService } from './company-profile.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-company-profile',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [CompanyProfileService],
})
export class CompanyProfileComponent implements OnInit {
  ngOnInit(): void {}
}
