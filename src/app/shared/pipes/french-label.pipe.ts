import { Pipe, type PipeTransform } from '@angular/core';
import { ABILITY_LABELS, SKILL_LABELS, SCHOOL_LABELS, CATEGORY_LABELS } from '../../data/labels.data';

type LabelCategory = 'ability' | 'skill' | 'school' | 'item';

const LABEL_MAPS: Record<LabelCategory, Record<string, string>> = {
  ability: ABILITY_LABELS,
  skill: SKILL_LABELS,
  school: SCHOOL_LABELS,
  item: CATEGORY_LABELS,
};

@Pipe({ name: 'frenchLabel' })
export class FrenchLabelPipe implements PipeTransform {
  transform(value: string | null | undefined, category: LabelCategory = 'ability'): string {
    if (!value) return '';
    const map = LABEL_MAPS[category];
    return map?.[value] || value;
  }
}
