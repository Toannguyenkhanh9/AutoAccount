import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class JournalTypeMaintenanceService {
  private authService = inject(AuthService);

}
