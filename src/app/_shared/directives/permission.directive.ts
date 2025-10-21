import {
  Directive,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { AuthPermission } from '../models/app';

@Directive({
  selector: '[appPermission]',
  standalone: true,
})
export class PermissionDirective implements OnInit, OnChanges {
  private hasView = false;
  @Input() appPermission: AuthPermission | AuthPermission[];
  @Input() appPermissionElse?: TemplateRef<unknown>;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.appPermission) {
      let isValidRole = true;

      if (Array.isArray(this.appPermission)) {
        isValidRole = this.appPermission.reduce((a, b) => {
          return a && this.authService.checkPermission(b);
        }, true);
      } else {
        isValidRole = this.authService.checkPermission(this.appPermission);
      }

      if (isValidRole) {
        if (!this.hasView) {
          this.viewContainerRef.createEmbeddedView(this.templateRef);
          this.hasView = true;
        }
      } else if (this.appPermissionElse) {
        if (!this.hasView) {
          this.viewContainerRef.createEmbeddedView(this.appPermissionElse);
          this.hasView = true;
        }
      } else if (this.hasView) {
        this.viewContainerRef.clear();
        this.hasView = false;
      }
    }
  }
}
