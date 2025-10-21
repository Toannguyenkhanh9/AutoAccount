import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class CreditorAgingReportService {
  private authService = inject(AuthService);

}
