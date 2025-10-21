import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class DebtorTypeMaintenanceService {
  private authService = inject(AuthService);

}
