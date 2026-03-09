import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CharacterState } from '../../../core/state/character.state';
import { GameDataState } from '../../../core/state/game-data.state';
import { SCHOOL_LABELS } from '../../../data/labels.data';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CharacterNavComponent } from '../components/character-nav/character-nav.component';
import { ItemDetailPanelComponent } from '../../../shared/components/item-detail-panel/item-detail-panel.component';
import { SpellPickerDialogComponent } from './spell-picker-dialog.component';
import type { SpellEntry, SpellSlots, Character } from '../../../models/character.model';

@Component({
  selector: 'app-grimoire',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    BackButtonComponent,
    LoadingSpinnerComponent,
    CharacterNavComponent,
    ItemDetailPanelComponent,
  ],
  templateUrl: './grimoire.component.html',
  styleUrl: './grimoire.component.scss',
})
export class GrimoireComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  readonly characterState = inject(CharacterState);
  private gameDataState = inject(GameDataState);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly character = this.characterState.currentCharacter;
  readonly characterId = signal('');

  readonly searchQuery = signal('');
  readonly levelFilter = signal<number | null>(null);
  readonly showPreparedOnly = signal(false);
  readonly expandedSpellId = signal<string | null>(null);

  readonly spellLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

  /** Map spellId → GameSpell for detail lookup */
  readonly spellDetailsMap = computed(() => {
    const map = new Map(this.gameDataState.spells().map(s => [s.id, s]));
    return map;
  });

  readonly filteredSpells = computed(() => {
    const char = this.character();
    if (!char) return [];
    const q = this.searchQuery().toLowerCase();
    const level = this.levelFilter();
    const prepOnly = this.showPreparedOnly();

    return char.spells.filter(s => {
      if (prepOnly && !s.prepared && !s.alwaysPrepared) return false;
      if (level !== null && s.level !== level) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  });

  /** Group filtered spells by level */
  readonly spellsByLevel = computed(() => {
    const groups = new Map<number, SpellEntry[]>();
    for (const spell of this.filteredSpells()) {
      const list = groups.get(spell.level) ?? [];
      list.push(spell);
      groups.set(spell.level, list);
    }
    return groups;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.characterId.set(id);
        this.characterState.loadOne(id);
        this.gameDataState.loadAll();
      }
    });
  }

  ngOnDestroy(): void {
    this.characterState.clearCurrent();
  }

  private immediateSave(updates: Partial<Character>): void {
    const char = this.character();
    if (!char) return;
    this.characterState.save(char.id, updates);
  }

  // --- Spell slots ---

  getSlotInfo(level: number): { max: number; used: number } {
    const char = this.character();
    return char?.spellSlots?.[level] ?? { max: 0, used: 0 };
  }

  useSlot(level: number): void {
    const char = this.character();
    if (!char) return;
    const slot = char.spellSlots?.[level] ?? { max: 0, used: 0 };
    if (slot.used >= slot.max) return;
    this.immediateSave({
      spellSlots: { ...char.spellSlots, [level]: { ...slot, used: slot.used + 1 } },
    });
  }

  recoverSlot(level: number): void {
    const char = this.character();
    if (!char) return;
    const slot = char.spellSlots?.[level] ?? { max: 0, used: 0 };
    if (slot.used <= 0) return;
    this.immediateSave({
      spellSlots: { ...char.spellSlots, [level]: { ...slot, used: slot.used - 1 } },
    });
  }

  updateSlotMax(level: number, value: string): void {
    const char = this.character();
    if (!char) return;
    const max = Math.max(0, parseInt(value, 10) || 0);
    const slot = char.spellSlots?.[level] ?? { max: 0, used: 0 };
    this.immediateSave({
      spellSlots: { ...char.spellSlots, [level]: { ...slot, max, used: Math.min(slot.used, max) } },
    });
  }

  // --- Spells ---

  togglePrepared(spell: SpellEntry): void {
    const char = this.character();
    if (!char || spell.alwaysPrepared) return;
    this.immediateSave({
      spells: char.spells.map(s =>
        s.spellId === spell.spellId ? { ...s, prepared: !s.prepared } : s,
      ),
    });
  }

  removeSpell(spell: SpellEntry): void {
    const char = this.character();
    if (!char) return;
    this.immediateSave({
      spells: char.spells.filter(s => s.spellId !== spell.spellId),
    });
    this.snackBar.open(`"${spell.name}" retiré`, 'OK', { duration: 1500 });
  }

  openSpellPicker(): void {
    const char = this.character();
    if (!char) return;

    const dialogRef = this.dialog.open(SpellPickerDialogComponent, {
      data: { alreadyAddedIds: char.spells.map(s => s.spellId) },
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((entry: SpellEntry | null) => {
      if (!entry) return;
      const updatedChar = this.character();
      if (!updatedChar) return;
      this.immediateSave({
        spells: [...updatedChar.spells, entry],
      });
      this.snackBar.open(`"${entry.name}" ajouté`, 'OK', { duration: 1500 });
    });
  }

  getSchoolLabel(school: string): string {
    return SCHOOL_LABELS[school] ?? school;
  }

  getLevelLabel(level: number): string {
    return level === 0 ? 'Tours de magie' : `Niveau ${level}`;
  }

  getSpellSchool(spellId: string): string {
    const detail = this.spellDetailsMap().get(spellId);
    return detail ? (SCHOOL_LABELS[detail.school] ?? detail.school) : '';
  }

  getSpellCastingTime(spellId: string): string {
    return this.spellDetailsMap().get(spellId)?.castingTime ?? '';
  }

  isConcentration(spellId: string): boolean {
    const detail = this.spellDetailsMap().get(spellId);
    return detail?.duration?.toLowerCase().includes('concentration') ?? false;
  }

  getLevelEntries(): number[] {
    return [...this.spellsByLevel().keys()];
  }

  toggleExpanded(spellId: string): void {
    this.expandedSpellId.set(this.expandedSpellId() === spellId ? null : spellId);
  }

  getSpellDetail(spellId: string) {
    return this.spellDetailsMap().get(spellId) ?? null;
  }
}
