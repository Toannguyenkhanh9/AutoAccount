import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth';
@Injectable()
export class MainService {
  private authService = inject(AuthService);

}
