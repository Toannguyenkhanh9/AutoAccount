import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class PaymentService {
  private authService = inject(AuthService);

}
