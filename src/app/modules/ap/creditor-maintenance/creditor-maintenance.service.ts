import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class CreditorMaintenanceService {
  private authService = inject(AuthService);

}
