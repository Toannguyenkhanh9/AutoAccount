import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class LastYearBalanceMaintenanceService {
  private authService = inject(AuthService);

}
