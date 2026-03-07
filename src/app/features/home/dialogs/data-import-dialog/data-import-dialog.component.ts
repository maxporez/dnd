import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { GameDataState } from '../../../../core/state/game-data.state';

@Component({
  selector: 'app-data-import-dialog',
  imports: [
    DatePipe,
    DecimalPipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">storage</mat-icon>
      Donnees SRD
    </h2>

    <mat-dialog-content>
      @if (gameDataState.isImporting()) {
        <div class="import-progress">
          <p class="import-message">{{ gameDataState.importMessage() }}</p>
          <mat-progress-bar
            mode="determinate"
            [value]="gameDataState.importProgress()"
          />
          <p class="progress-percent">{{ gameDataState.importProgress() | number:'1.0-0' }}%</p>
        </div>
      } @else if (gameDataState.error()) {
        <div class="import-error">
          <mat-icon>error</mat-icon>
          <span>{{ gameDataState.error() }}</span>
        </div>
      } @else if (gameDataState.hasData()) {
        <div class="data-summary">
          <p class="summary-label">Donnees actuellement importees :</p>
          <ul class="data-counts">
            <li>
              <mat-icon>groups</mat-icon>
              <span>{{ gameDataState.dataCounts().races }} races</span>
            </li>
            <li>
              <mat-icon>shield</mat-icon>
              <span>{{ gameDataState.dataCounts().classes }} classes</span>
            </li>
            <li>
              <mat-icon>auto_fix_high</mat-icon>
              <span>{{ gameDataState.dataCounts().spells }} sorts</span>
            </li>
            <li>
              <mat-icon>inventory_2</mat-icon>
              <span>{{ gameDataState.dataCounts().items }} objets</span>
            </li>
          </ul>

          @if (gameDataState.importStatus(); as status) {
            <p class="import-date">
              Dernier import : {{ status.lastImport | date:'dd/MM/yyyy HH:mm' }}
            </p>
          }
        </div>
      } @else {
        <div class="no-data">
          <mat-icon class="no-data-icon">cloud_download</mat-icon>
          <p>Aucune donnee importee.</p>
          <p class="no-data-hint">
            Importez les donnees du SRD 5.1 pour pouvoir creer des personnages
            avec les races, classes, sorts et objets de base.
          </p>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">
        Fermer
      </button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="gameDataState.isImporting()"
        (click)="importData()"
      >
        <mat-icon>{{ gameDataState.hasData() ? 'refresh' : 'download' }}</mat-icon>
        {{ gameDataState.hasData() ? 'Reimporter' : 'Importer les donnees SRD' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title-icon {
      color: #bb86fc;
    }

    mat-dialog-content {
      min-height: 120px;
    }

    /* Import progress */
    .import-progress {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 0;
    }

    .import-message {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      text-align: center;
    }

    .progress-percent {
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;
      text-align: center;
    }

    /* Error */
    .import-error {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ef5350;
      padding: 16px 0;

      mat-icon {
        flex-shrink: 0;
      }
    }

    /* Data summary */
    .data-summary {
      padding: 8px 0;
    }

    .summary-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      margin-bottom: 12px;
    }

    .data-counts {
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      li {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;

        mat-icon {
          color: #bb86fc;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    .import-date {
      margin-top: 16px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 12px;
    }

    /* No data */
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px 0;
      text-align: center;

      p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
      }
    }

    .no-data-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: rgba(255, 255, 255, 0.2);
    }

    .no-data-hint {
      color: rgba(255, 255, 255, 0.45) !important;
      font-size: 13px !important;
      max-width: 320px;
    }

    /* Actions */
    mat-dialog-actions button {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `,
})
export class DataImportDialogComponent {
  readonly gameDataState = inject(GameDataState);
  readonly dialogRef = inject(MatDialogRef<DataImportDialogComponent>);

  async importData(): Promise<void> {
    await this.gameDataState.importSrdData();
  }
}
