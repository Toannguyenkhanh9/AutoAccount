import { Injectable } from '@angular/core';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';

function isDate(value: any): value is Date {
  return Object.prototype.toString.call(value) === '[object Date]';
}

/**
 * This Service handles how the date is represented in scripts i.e. ngModel.
 */
@Injectable()
export class CustomAdapter extends NgbDateAdapter<Date> {
  fromModel(date: Date | string | null): NgbDateStruct | null {
    if (typeof date === 'string') {
      date = new Date(date);
      date = isNaN(date.getTime()) ? null : date;
    }

    return isDate(date)
      ? {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
        }
      : null;
  }

  toModel(date: NgbDateStruct | null): Date | null {
    return date !== null &&
      date.day !== null &&
      date.year !== null &&
      date.month !== null
      ? new Date(date.year, date.month - 1, date.day)
      : null;
  }
}

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '/';
  readonly FORMAT_TYPE: 'dd/MM/yyyy' | 'MM/dd/yyyy' = 'MM/dd/yyyy';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    switch (this.FORMAT_TYPE) {
      case 'MM/dd/yyyy':
        return date
          ? date.month.toString().padStart(2, '0') +
              this.DELIMITER +
              date.day.toString().padStart(2, '0') +
              this.DELIMITER +
              date.year
          : '';

      default:
        // 'dd/MM/yyyy';
        return date
          ? date.day.toString().padStart(2, '0') +
              this.DELIMITER +
              date.month.toString().padStart(2, '0') +
              this.DELIMITER +
              date.year
          : '';
    }
  }
}
