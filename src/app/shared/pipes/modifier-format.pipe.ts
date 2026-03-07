import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({ name: 'modifierFormat' })
export class ModifierFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '+0';
    return value >= 0 ? `+${value}` : `${value}`;
  }
}
