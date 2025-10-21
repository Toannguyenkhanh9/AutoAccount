import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class CurrencyMaintenanceService {
  private authService = inject(AuthService);

}
