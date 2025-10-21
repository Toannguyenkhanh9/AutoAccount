import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class DocumentNumberingFormatMaintenanceService {
  private authService = inject(AuthService);

}
