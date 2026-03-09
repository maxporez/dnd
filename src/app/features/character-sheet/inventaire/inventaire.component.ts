import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CharacterState } from '../../../core/state/character.state';
import { GameDataState } from '../../../core/state/game-data.state';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CharacterNavComponent } from '../components/character-nav/character-nav.component';
import { ItemPickerDialogComponent } from './item-picker-dialog.component';
import type { InventoryItem, Currency, Character } from '../../../models/character.model';

@Component({
  selector: 'app-inventaire',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    DecimalPipe,
    BackButtonComponent,
    LoadingSpinnerComponent,
    CharacterNavComponent,
  ],
  templateUrl: './inventaire.component.html',
  styleUrl: './inventaire.component.scss',
})
export class InventaireComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  readonly characterState = inject(CharacterState);
  private gameDataState = inject(GameDataState);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly character = this.characterState.currentCharacter;
  readonly characterId = signal('');

  readonly searchQuery = signal('');
  readonly showEquippedOnly = signal(false);

  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly filteredInventory = computed(() => {
    const char = this.character();
    if (!char) return [];
    const q = this.searchQuery().toLowerCase();
    const equippedOnly = this.showEquippedOnly();
    return char.inventory.filter(item => {
      if (equippedOnly && !item.equipped) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  readonly totalWeight = computed(() => {
    const char = this.character();
    if (!char) return 0;
    return char.inventory.reduce((acc, item) => {
      const gameItem = this.gameDataState.items().find(i => i.id === item.itemId);
      return acc + (gameItem?.weight ?? 0) * item.quantity;
    }, 0);
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
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.characterState.clearCurrent();
  }

  private immediateSave(updates: Partial<Character>): void {
    const char = this.character();
    if (!char) return;
    this.characterState.save(char.id, updates);
  }

  private debouncedSave(updates: Partial<Character>): void {
    const char = this.character();
    if (!char) return;
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.characterState.save(char.id, updates);
    }, 500);
  }

  // --- Currency ---

  onCurrencyChange(field: keyof Currency, value: string): void {
    const char = this.character();
    if (!char) return;
    const numVal = Math.max(0, parseInt(value, 10) || 0);
    this.debouncedSave({
      currency: { ...char.currency, [field]: numVal },
    });
  }

  // --- Inventory Actions ---

  toggleEquipped(item: InventoryItem): void {
    const char = this.character();
    if (!char) return;
    this.immediateSave({
      inventory: char.inventory.map(i =>
        i.id === item.id ? { ...i, equipped: !i.equipped } : i,
      ),
    });
  }

  toggleAttuned(item: InventoryItem): void {
    const char = this.character();
    if (!char) return;
    this.immediateSave({
      inventory: char.inventory.map(i =>
        i.id === item.id ? { ...i, attuned: !i.attuned } : i,
      ),
    });
  }

  changeQuantity(item: InventoryItem, delta: number): void {
    const char = this.character();
    if (!char) return;
    const newQty = Math.max(0, item.quantity + delta);
    this.immediateSave({
      inventory: char.inventory.map(i =>
        i.id === item.id ? { ...i, quantity: newQty } : i,
      ),
    });
  }

  removeItem(item: InventoryItem): void {
    const char = this.character();
    if (!char) return;
    this.immediateSave({
      inventory: char.inventory.filter(i => i.id !== item.id),
    });
    this.snackBar.open(`"${item.name}" retiré`, 'OK', { duration: 1500 });
  }

  openItemPicker(): void {
    const char = this.character();
    if (!char) return;

    const dialogRef = this.dialog.open(ItemPickerDialogComponent, {
      data: { alreadyAddedIds: char.inventory.map(i => i.itemId).filter(Boolean) },
      width: '480px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((newItem: InventoryItem | null) => {
      if (!newItem) return;
      const updatedChar = this.character();
      if (!updatedChar) return;
      this.immediateSave({
        inventory: [...updatedChar.inventory, newItem],
      });
      this.snackBar.open(`"${newItem.name}" ajouté`, 'OK', { duration: 1500 });
    });
  }
}
