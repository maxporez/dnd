import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { GameDataState } from '../../core/state/game-data.state';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-homebrew',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    BackButtonComponent,
  ],
  templateUrl: './homebrew.component.html',
  styleUrl: './homebrew.component.scss',
})
export class HomebrewComponent implements OnInit {
  private gameDataState = inject(GameDataState);

  readonly races = this.gameDataState.races;
  readonly classes = this.gameDataState.classes;
  readonly spells = this.gameDataState.spells;
  readonly items = this.gameDataState.items;

  ngOnInit(): void {
    this.gameDataState.loadAll();
  }
}
