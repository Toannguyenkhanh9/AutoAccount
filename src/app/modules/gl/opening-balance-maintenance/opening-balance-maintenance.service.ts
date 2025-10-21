import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class OpeningBalanceMaintenanceService {
  private authService = inject(AuthService);

}
