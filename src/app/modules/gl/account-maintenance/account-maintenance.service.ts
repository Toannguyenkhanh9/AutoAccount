import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class AccountMaintenanceService {
  private authService = inject(AuthService);

}
