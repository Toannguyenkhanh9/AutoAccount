import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class DebtorMaintenanceService {
  private authService = inject(AuthService);

}
