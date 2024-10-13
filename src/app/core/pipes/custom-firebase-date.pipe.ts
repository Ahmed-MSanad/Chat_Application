import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'customFirebaseDate',
  standalone: true
})
export class CustomFirebaseDatePipe implements PipeTransform {

  private readonly _DatePipe = inject(DatePipe);

  transform(value: Timestamp | undefined): string {
    return this._DatePipe.transform(value?.toMillis(), 'short') ?? "";
  }

}
