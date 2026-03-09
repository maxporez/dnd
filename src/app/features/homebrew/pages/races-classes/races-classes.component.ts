import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GameDataState } from '../../../../core/state/game-data.state';
import { GameDataService } from '../../../../core/services/game-data.service';
import { GameDataEditorDialogComponent, type GameDataEditorDialogData } from '../../dialogs/game-data-editor-dialog.component';
import { ConfirmDialogComponent, type ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import type { GameRace, GameClass } from '../../../../models/game-data.model';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-races-classes',
  imports: [
    FormsModule,
    UpperCasePipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    BackButtonComponent,
  ],
  templateUrl: './races-classes.component.html',
  styleUrl: './races-classes.component.scss',
})
export class RacesClassesComponent implements OnInit {
  private gameDataState = inject(GameDataState);
  private gameDataService = inject(GameDataService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly searchQuery = signal('');
  readonly isLoading = this.gameDataState.isLoading;

  readonly filteredRaces = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.gameDataState.races();
    return this.gameDataState.races().filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.source.toLowerCase().includes(query),
    );
  });

  readonly filteredClasses = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.gameDataState.classes();
    return this.gameDataState.classes().filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.source.toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.gameDataState.loadAll();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  getAbilityBonusSummary(bonuses: { ability: string; bonus: number }[]): string {
    return bonuses.map(b => `${b.ability.toUpperCase()} +${b.bonus}`).join(', ');
  }

  openRaceEditor(race?: GameRace): void {
    this.openEditor({
      type: 'race',
      item: race ?? this.createDefaultRace(),
      isNew: !race,
    });
  }

  openClassEditor(gameClass?: GameClass): void {
    this.openEditor({
      type: 'class',
      item: gameClass ?? this.createDefaultClass(),
      isNew: !gameClass,
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
          await this.handleDelete(data.type, result.item.id);
        } else if (result.action === 'save') {
          await this.handleSave(data.type, result.item);
        }
        await this.gameDataState.loadAll();
      } catch {
        this.snackBar.open('Erreur lors de la sauvegarde', 'OK', { duration: 3000 });
      }
    });
  }

  private async handleSave(type: string, item: any): Promise<void> {
    if (type === 'race') {
      await this.gameDataService.saveRace(item);
      this.snackBar.open(`Race "${item.name}" sauvegardée`, 'OK', { duration: 2000 });
    } else {
      await this.gameDataService.saveClass(item);
      this.snackBar.open(`Classe "${item.name}" sauvegardée`, 'OK', { duration: 2000 });
    }
  }

  private async handleDelete(type: string, id: string): Promise<void> {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer',
        message: 'Voulez-vous vraiment supprimer cet élément ?',
        confirmText: 'Supprimer',
        warn: true,
      } as ConfirmDialogData,
    });

    const confirmed = await new Promise<boolean>(resolve => {
      confirmRef.afterClosed().subscribe(result => resolve(!!result));
    });

    if (!confirmed) return;

    if (type === 'race') {
      await this.gameDataService.deleteRace(id);
      this.snackBar.open('Race supprimée', 'OK', { duration: 2000 });
    } else {
      await this.gameDataService.deleteClass(id);
      this.snackBar.open('Classe supprimée', 'OK', { duration: 2000 });
    }
  }

  private createDefaultRace(): GameRace {
    return {
      id: crypto.randomUUID().replace(/-/g, ''),
      name: '',
      source: 'Homebrew',
      speed: 30,
      size: 'Medium',
      abilityBonuses: [],
      traits: [],
      languages: ['Commun'],
      description: '',
    };
  }

  private createDefaultClass(): GameClass {
    return {
      id: crypto.randomUUID().replace(/-/g, ''),
      name: '',
      source: 'Homebrew',
      hitDie: 8,
      primaryAbility: [],
      savingThrows: [],
      skillChoices: { count: 2, from: [] },
      armorProficiencies: [],
      weaponProficiencies: [],
      description: '',
    };
  }
}
