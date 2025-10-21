import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class DeborAgingReportService {
  private authService = inject(AuthService);

}
