import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class ReceivePaymentService {
  private authService = inject(AuthService);

}
