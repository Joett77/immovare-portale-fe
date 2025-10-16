// number-format.pipe.ts (create this in a shared folder)
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
  standalone: true,
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';

    // Convert to string and format with thousand separators
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
