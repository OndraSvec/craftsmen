import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixedOne',
  standalone: true,
})
export class ToFixedOnePipe implements PipeTransform {
  transform(value: number): string {
    return value.toFixed(1);
  }
}
