import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class StockValueMaintenanceService {
  private authService = inject(AuthService);

}
