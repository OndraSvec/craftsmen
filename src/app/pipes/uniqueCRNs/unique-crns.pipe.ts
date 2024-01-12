import { Pipe, PipeTransform } from '@angular/core';
import { Craftsman } from 'src/app/services/firestore/credentials.type';

@Pipe({
  name: 'uniqueCRNs',
  standalone: true,
})
export class UniqueCRNsPipe implements PipeTransform {
  transform(craftsmen: Craftsman[]): number[] {
    const result: number[] = [];
    craftsmen.forEach(
      (craftsman) =>
        !result.includes(craftsman.CRN) && result.push(craftsman.CRN)
    );
    return result;
  }
}
