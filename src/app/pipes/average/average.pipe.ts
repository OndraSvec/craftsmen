import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'average',
  standalone: true,
})
export class AveragePipe implements PipeTransform {
  transform(items: any[], attr: string): string {
    const sum = items.reduce((acc, cur) => (acc += cur[attr]), 0);
    const average = sum / items.length;
    return isNaN(average) ? 'Unrated' : average.toFixed(1);
  }
}
