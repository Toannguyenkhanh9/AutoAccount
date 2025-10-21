import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class CreditorTypeMaintenanceService {
  private authService = inject(AuthService);

}
