import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { ChatInnerModule } from '../../content/chat-inner/chat-inner.module';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    InlineSVGModule,
    RouterModule,
    ChatInnerModule,
    SharedModule,
  ],
  exports: [],
})
export class DrawersModule {}
