import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GameDataState } from '../../../../core/state/game-data.state';
import { GameDataService } from '../../../../core/services/game-data.service';
import { SCHOOL_LABELS } from '../../../../data/labels.data';
import { GameDataEditorDialogComponent, type GameDataEditorDialogData } from '../../dialogs/game-data-editor-dialog.component';
import { ConfirmDialogComponent, type ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import type { GameSpell } from '../../../../models/game-data.model';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-sorts',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    BackButtonComponent,
  ],
  templateUrl: './sorts.component.html',
  styleUrl: './sorts.component.scss',
})
export class SortsComponent implements OnInit {
  private gameDataState = inject(GameDataState);
  private gameDataService = inject(GameDataService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly searchQuery = signal('');
  readonly schoolFilter = signal('');
  readonly levelFilter = signal<number | null>(null);
  readonly isLoading = this.gameDataState.isLoading;

  readonly schoolLabels = SCHOOL_LABELS;

  readonly schools = [
    { id: 'abjuration', label: 'Abjuration' },
    { id: 'conjuration', label: 'Invocation' },
    { id: 'divination', label: 'Divination' },
    { id: 'enchantment', label: 'Enchantement' },
    { id: 'evocation', label: 'Évocation' },
    { id: 'illusion', label: 'Illusion' },
    { id: 'necromancy', label: 'Nécromancie' },
    { id: 'transmutation', label: 'Transmutation' },
  ] as const;

  readonly levels = [
    { id: 0, label: 'Tour de magie' },
    { id: 1, label: 'Niv. 1' },
    { id: 2, label: 'Niv. 2' },
    { id: 3, label: 'Niv. 3' },
    { id: 4, label: 'Niv. 4' },
    { id: 5, label: 'Niv. 5' },
    { id: 6, label: 'Niv. 6' },
    { id: 7, label: 'Niv. 7' },
    { id: 8, label: 'Niv. 8' },
    { id: 9, label: 'Niv. 9' },
  ] as const;

  readonly filteredSpells = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const school = this.schoolFilter();
    const level = this.levelFilter();

    return this.gameDataState.spells().filter(s => {
      if (query && !(
        s.name.toLowerCase().includes(query) ||
        s.source.toLowerCase().includes(query) ||
        s.school.toLowerCase().includes(query) ||
        s.classes?.some(c => c.toLowerCase().includes(query))
      )) return false;
      if (school && s.school !== school) return false;
      if (level !== null && s.level !== level) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.gameDataState.loadAll();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  toggleSchool(school: string): void {
    this.schoolFilter.set(this.schoolFilter() === school ? '' : school);
  }

  toggleLevel(level: number): void {
    this.levelFilter.set(this.levelFilter() === level ? null : level);
  }

  getSchoolLabel(school: string): string {
    return this.schoolLabels[school] ?? school;
  }

  getSpellLevelLabel(level: number): string {
    return level === 0 ? 'Tour de magie' : `Niveau ${level}`;
  }

  openSpellDetail(spell: GameSpell): void {
    this.openEditor({
      type: 'spell',
      item: spell,
      isNew: false,
    });
  }

  openSpellEditor(spell?: GameSpell): void {
    this.openEditor({
      type: 'spell',
      item: spell ?? this.createDefaultSpell(),
      isNew: !spell,
    });
  }

  private openEditor(data: GameDataEditorDialogData): void {
    const dialogRef = this.dialog.open(GameDataEditorDialogComponent, {
      data,
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe(async (result: { action: 'save' | 'delete'; item: any } | undefined) => {
      if (!result) return;
      try {
        if (result.action === 'delete') {
          await this.handleDelete(result.item.id);
        } else if (result.action === 'save') {
          await this.gameDataService.saveSpell(result.item);
          this.snackBar.open(`Sort "${result.item.name}" sauvegardé`, 'OK', { duration: 2000 });
        }
        await this.gameDataState.loadAll();
      } catch {
        this.snackBar.open('Erreur lors de la sauvegarde', 'OK', { duration: 3000 });
      }
    });
  }

  private async handleDelete(id: string): Promise<void> {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer',
        message: 'Voulez-vous vraiment supprimer ce sort ?',
        confirmText: 'Supprimer',
        warn: true,
      } as ConfirmDialogData,
    });

    const confirmed = await new Promise<boolean>(resolve => {
      confirmRef.afterClosed().subscribe(result => resolve(!!result));
    });

    if (!confirmed) return;
    await this.gameDataService.deleteSpell(id);
    this.snackBar.open('Sort supprimé', 'OK', { duration: 2000 });
  }

  private createDefaultSpell(): GameSpell {
    return {
      id: crypto.randomUUID().replace(/-/g, ''),
      name: '',
      level: 0,
      school: 'evocation',
      castingTime: '1 action',
      range: '18 mètres',
      components: { verbal: true, somatic: false },
      duration: 'Instantanée',
      description: '',
      classes: [],
      source: 'Homebrew',
    };
  }
}
