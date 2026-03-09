import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SCHOOL_LABELS, CATEGORY_LABELS } from '../../../data/labels.data';
import type { GameSpell, GameItem } from '../../../models/game-data.model';

@Component({
  selector: 'app-item-detail-panel',
  imports: [MatIconModule],
  templateUrl: './item-detail-panel.component.html',
  styleUrl: './item-detail-panel.component.scss',
})
export class ItemDetailPanelComponent {
  spell = input<GameSpell | null>(null);
  item = input<GameItem | null>(null);

  getSchoolLabel(school: string): string {
    return SCHOOL_LABELS[school] ?? school;
  }

  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  getComponents(spell: GameSpell): string {
    const parts: string[] = [];
    if (spell.components?.verbal) parts.push('V');
    if (spell.components?.somatic) parts.push('S');
    if (spell.components?.material) parts.push('M');
    return parts.join(', ');
  }

  getMaterialDetail(spell: GameSpell): string {
    return typeof spell.components?.material === 'string' ? spell.components.material : '';
  }
}
