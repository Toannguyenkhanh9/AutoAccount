import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    TranslateModule,
  ],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent implements OnChanges, OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  @Input() isLoading = true;
  @Input() showTotalRows = true;
  @Input() showPageSize = true;
  @Input() boundaryLinks = false;
  @Input() collectionSize = 1000000;
  @Input() directionLinks = true;
  @Input() disabled = false;
  @Input() ellipses = true;
  @Input() maxSize = 3;
  @Input() pageSize = 20;
  @Input() page = 1;
  @Input() rotate = true;
  @Input() size: 'sm' | 'lg' = 'sm';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pageSizeControl = new FormControl();

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageSize']) {
      this.pageSizeControl.setValue(changes['pageSize'].currentValue);
    }

    if (changes['isLoading']) {
      changes['isLoading'].currentValue
        ? this.pageSizeControl.disable()
        : this.pageSizeControl.enable();
    }
  }

  ngOnInit(): void {
    this.pageSizeControl.setValue(this.pageSize);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s?.unsubscribe());
  }
}
