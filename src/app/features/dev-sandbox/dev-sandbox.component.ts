import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CharacterIdentityCardComponent } from '../../shared/components/cards/character-identity-card/character-identity-card.component';
import { AbilityScoresCardComponent } from '../../shared/components/cards/ability-scores-card/ability-scores-card.component';
import { MOCK_COMPUTED_CHARACTER } from './mock-character.data';

@Component({
  selector: 'app-dev-sandbox',
  standalone: true,
  imports: [MatTabsModule, CharacterIdentityCardComponent, AbilityScoresCardComponent],
  template: `
    <div class="sandbox-page">
      <div class="sandbox-header">
        <h1 class="sandbox-title">Dev Sandbox</h1>
        <span class="dev-badge">DEV ONLY</span>
      </div>

      <mat-tab-group animationDuration="200ms">
        <mat-tab label="Identity Card">
          <div class="preview-area">
            <div class="preview-label">CharacterIdentityCardComponent</div>
            <div class="card-wrapper narrow">
              <app-character-identity-card [character]="mockCharacter" />
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Ability Scores Card">
          <div class="preview-area">
            <div class="preview-label">AbilityScoresCardComponent</div>
            <div class="card-wrapper narrow">
              <app-ability-scores-card [character]="mockCharacter" />
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Les deux">
          <div class="preview-area">
            <div class="preview-label">Vue combinée</div>
            <div class="card-wrapper two-col">
              <app-character-identity-card [character]="mockCharacter" />
              <app-ability-scores-card [character]="mockCharacter" />
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .sandbox-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 16px;
    }

    .sandbox-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .sandbox-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--ink);
      margin: 0;
    }

    .dev-badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      background: var(--crimson);
      color: #fff;
      border-radius: 4px;
      padding: 2px 8px;
    }

    .preview-area {
      padding: 20px 0;
    }

    .preview-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--ink-muted);
      margin-bottom: 12px;
      font-family: 'Roboto Mono', monospace;
    }

    .card-wrapper {
      &.narrow {
        max-width: 380px;
      }

      &.two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        max-width: 760px;

        @media (max-width: 600px) {
          grid-template-columns: 1fr;
        }
      }
    }
  `],
})
export class DevSandboxComponent {
  readonly mockCharacter = MOCK_COMPUTED_CHARACTER;
}
