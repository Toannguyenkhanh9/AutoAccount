import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from './modal/modal.component';
import { MainModalComponent } from './main-modal/main-modal.component';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';

@NgModule({
  declarations: [MainModalComponent, ModalComponent],
  imports: [
    CommonModule,
    InlineSVGModule,
    RouterModule,
    NgbModalModule,
    SharedModule,
  ],
  exports: [MainModalComponent, ModalComponent],
})
export class ModalsModule {}
