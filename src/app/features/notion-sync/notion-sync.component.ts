import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { NotionApiService, type NotionStatus } from '../../core/services/notion-api.service';
import { NotionSyncService } from '../../core/services/notion-sync.service';
import { CharacterState } from '../../core/state/character.state';
import { GameDataState } from '../../core/state/game-data.state';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

type SyncState = 'idle' | 'syncing' | 'success' | 'error';
type DbKey = 'characters' | 'races' | 'classes' | 'spells' | 'items';
type DbIds = Record<DbKey, string>;

@Component({
  selector: 'app-notion-sync',
  imports: [
    FormsModule,
    MatButtonModule, MatCardModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatProgressBarModule,
    MatSnackBarModule, MatDividerModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="notion-page page-container">

      <header class="notion-header">
        <mat-icon class="notion-icon">sync</mat-icon>
        <div>
          <h1>Notion Back-Office</h1>
          <p class="subtitle">Gérez vos données D&D depuis Notion</p>
        </div>
      </header>

      @if (loading()) {
        <app-loading-spinner message="Vérification de la connexion Notion..." />
      } @else if (!status()?.connected) {

        <!-- ===== CONNEXION FORM ===== -->
        <mat-card class="login-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>key</mat-icon>
            <mat-card-title>Connexion à Notion</mat-card-title>
            <mat-card-subtitle>
              Entrez votre clé API et l'ID de la page parente pour connecter votre workspace.
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Clé API Notion</mat-label>
              <input matInput type="password" [(ngModel)]="apiKey"
                     placeholder="ntn_xxxxxxxxxxxxx..." [disabled]="connectLoading()" />
              <mat-hint>
                Depuis <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener">notion.so/my-integrations</a>
              </mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>ID de la page parente</mat-label>
              <input matInput type="text" [(ngModel)]="pageId"
                     placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" [disabled]="connectLoading()" />
              <mat-hint>L'ID se trouve dans l'URL de votre page Notion</mat-hint>
            </mat-form-field>

            @if (connectError()) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                {{ connectError() }}
              </div>
            }
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-flat-button color="primary"
                    (click)="handleConnect()"
                    [disabled]="connectLoading() || !apiKey.trim() || !pageId.trim()">
              @if (connectLoading()) { Connexion... } @else { Se connecter }
            </button>
          </mat-card-actions>
        </mat-card>

      } @else {

        <!-- ===== CONNECTED STATE ===== -->

        <!-- Connection status -->
        <mat-card class="status-card">
          <mat-card-content>
            <div class="status-row">
              <div class="status-indicator connected"></div>
              <div class="status-info">
                <strong>Connecté</strong>
                @if (status()?.user) {
                  <span class="status-user"> — {{ status()?.user }}</span>
                }
              </div>
              <button mat-stroked-button color="warn" (click)="handleDisconnect()">
                <mat-icon>logout</mat-icon> Déconnexion
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Database setup -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>storage</mat-icon>
            <mat-card-title>Bases de données Notion</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (!status()?.configured) {
              <p class="info-text">
                Les bases de données n'ont pas encore été créées dans votre espace Notion.
                Vous pouvez les créer automatiquement ou entrer les IDs de bases existantes.
              </p>

              <div class="setup-actions">
                <button mat-flat-button color="primary"
                        (click)="handleSetup()"
                        [disabled]="syncState() === 'syncing'">
                  <mat-icon>add_circle</mat-icon>
                  Créer les bases de données
                </button>
              </div>

              <mat-divider class="my-divider">
                <span class="divider-text">ou configurer manuellement</span>
              </mat-divider>

              <div class="db-config">
                @for (entry of dbIdEntries(); track entry.key) {
                  <mat-form-field appearance="outline" class="db-field">
                    <mat-label>{{ entry.key }}</mat-label>
                    <input matInput [(ngModel)]="dbIds[entry.key]"
                           placeholder="ID de la base Notion..." />
                  </mat-form-field>
                }
                <button mat-stroked-button (click)="handleConfigure()"
                        [disabled]="syncState() === 'syncing'">
                  Enregistrer la configuration
                </button>
              </div>
            } @else {
              <div class="db-status">
                @for (entry of dbIdEntries(); track entry.key) {
                  <div class="db-row">
                    <span class="db-name">{{ entry.key }}</span>
                    <code class="db-id">{{ entry.value ? (entry.value.slice(0, 8) + '...') : 'Non configuré' }}</code>
                    <mat-icon [class]="entry.value ? 'icon-ok' : 'icon-missing'">
                      {{ entry.value ? 'check_circle' : 'error' }}
                    </mat-icon>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Sync actions -->
        @if (status()?.configured) {
          <mat-card class="section-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>sync_alt</mat-icon>
              <mat-card-title>Synchronisation</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="sync-actions">
                <div class="sync-option" (click)="handleSyncFromNotion()"
                     [class.disabled]="syncState() === 'syncing'">
                  <mat-icon class="sync-arrow">south</mat-icon>
                  <div class="sync-option-text">
                    <strong>Importer depuis Notion</strong>
                    <span>Récupère races, classes, sorts et objets depuis vos bases Notion</span>
                  </div>
                </div>

                <mat-divider />

                <div class="sync-option" (click)="handlePushCharacters()"
                     [class.disabled]="syncState() === 'syncing'">
                  <mat-icon class="sync-arrow">north</mat-icon>
                  <div class="sync-option-text">
                    <strong>Exporter les personnages</strong>
                    <span>Envoie vos {{ characterCount() }} personnage(s) vers Notion pour backup</span>
                  </div>
                </div>
              </div>

              @if (syncState() !== 'idle') {
                <div class="sync-feedback" [class]="'sync-feedback--' + syncState()">
                  @if (syncState() === 'syncing') {
                    <mat-progress-bar mode="determinate" [value]="syncProgress()" />
                  }
                  <div class="sync-message-row">
                    @if (syncState() === 'success') { <mat-icon class="icon-ok">check_circle</mat-icon> }
                    @if (syncState() === 'error') { <mat-icon class="icon-missing">error</mat-icon> }
                    @if (syncState() === 'syncing') { <mat-icon class="spinning">refresh</mat-icon> }
                    <p>{{ syncMessage() }}</p>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }

        <!-- How it works -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>help_outline</mat-icon>
            <mat-card-title>Comment ça marche</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ol class="how-it-works">
              <li>Vos données de jeu (races, classes, sorts, objets) vivent dans Notion</li>
              <li>Vous les éditez directement dans l'interface Notion</li>
              <li>Cliquez "Importer depuis Notion" pour synchroniser dans l'app</li>
              <li>Les personnages sont stockés localement et peuvent être sauvegardés sur Notion</li>
            </ol>
          </mat-card-content>
        </mat-card>

      }
    </div>
  `,
  styles: `
    .notion-page {
      max-width: 720px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 40px;
    }

    .notion-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
    }

    .notion-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--crimson);
    }

    .notion-header h1 {
      margin: 0;
      font-size: 24px;
    }

    .subtitle {
      color: var(--ink-secondary);
      margin: 0;
    }

    /* Login card */
    .login-card mat-card-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
    }

    .full-width { width: 100%; }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #cf6679;
      font-size: 14px;
    }

    /* Status */
    .status-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-indicator {
      width: 12px; height: 12px;
      border-radius: 50%;
      &.connected { background: #4caf50; box-shadow: 0 0 6px #4caf5066; }
    }

    .status-info {
      flex: 1;
    }

    .status-user {
      color: var(--ink-secondary);
    }

    /* DB config */
    .my-divider {
      margin: 20px 0;
    }

    .divider-text {
      color: var(--ink-muted);
      font-size: 12px;
      padding: 0 8px;
    }

    .db-config {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .db-field { width: 100%; }

    .db-status {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .db-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 4px;
      background: var(--parchment-hover);
    }

    .db-name {
      text-transform: capitalize;
      min-width: 100px;
      font-weight: 500;
    }

    .db-id {
      flex: 1;
      font-size: 12px;
      color: var(--ink-muted);
    }

    /* Sync */
    .setup-actions {
      margin-bottom: 16px;
    }

    .sync-actions {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .sync-option {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;

      &:hover { background: var(--parchment-hover); }
      &.disabled { opacity: 0.5; pointer-events: none; }
    }

    .sync-arrow {
      font-size: 32px;
      width: 32px; height: 32px;
      color: var(--crimson);
    }

    .sync-option-text {
      display: flex;
      flex-direction: column;
      gap: 4px;

      span { color: var(--ink-secondary); font-size: 13px; }
    }

    .sync-feedback {
      margin-top: 16px;
      border-radius: 4px;
      padding: 12px;
      background: var(--parchment-hover);

      mat-progress-bar { margin-bottom: 12px; }
    }

    .sync-message-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Icons */
    .icon-ok { color: #4caf50; }
    .icon-missing { color: #cf6679; }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* How it works */
    .how-it-works {
      padding-left: 20px;
      line-height: 2;
      color: var(--ink-secondary);
    }

    .info-text {
      color: var(--ink-secondary);
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .section-card mat-card-content {
      padding-top: 16px;
    }
  `,
})
export class NotionSyncComponent implements OnInit {
  private notionApi = inject(NotionApiService);
  private notionSync = inject(NotionSyncService);
  private characterState = inject(CharacterState);
  private gameDataState = inject(GameDataState);
  private snackBar = inject(MatSnackBar);

  // --- Signals ---
  readonly loading = signal(true);
  readonly status = signal<NotionStatus | null>(null);
  readonly syncState = signal<SyncState>('idle');
  readonly syncMessage = signal('');
  readonly syncProgress = signal(0);
  readonly connectLoading = signal(false);
  readonly connectError = signal('');
  readonly characterCount = signal(0);

  // --- Form state ---
  apiKey = '';
  pageId = '';
  dbIds: DbIds = { characters: '', races: '', classes: '', spells: '', items: '' };

  // --- Computed ---
  readonly dbKeys: DbKey[] = ['characters', 'races', 'classes', 'spells', 'items'];

  dbIdEntries() {
    return this.dbKeys.map(key => ({
      key,
      value: this.dbIds[key] ?? '',
    }));
  }

  async ngOnInit(): Promise<void> {
    await this.refreshStatus();
    const chars = await this.characterState.characters();
    this.characterCount.set(chars.length > 0 ? chars.length : (await this.loadCharacterCount()));
  }

  private async loadCharacterCount(): Promise<number> {
    await this.characterState.loadAll();
    return this.characterState.characterCount();
  }

  async refreshStatus(): Promise<void> {
    this.loading.set(true);
    try {
      const s = await this.notionApi.getStatus();
      this.status.set(s);
      if (s.databases) {
        this.dbIds = {
          characters: s.databases.characters ?? '',
          races: s.databases.races ?? '',
          classes: s.databases.classes ?? '',
          spells: s.databases.spells ?? '',
          items: s.databases.items ?? '',
        };
      }
      if (s.envHints) {
        if (s.envHints.apiKey) this.apiKey = s.envHints.apiKey;
        if (s.envHints.pageId) this.pageId = s.envHints.pageId;
      }
    } catch {
      this.status.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async handleConnect(): Promise<void> {
    if (!this.apiKey.trim() || !this.pageId.trim()) {
      this.connectError.set('Veuillez remplir les deux champs');
      return;
    }
    this.connectLoading.set(true);
    this.connectError.set('');
    try {
      await this.notionApi.connect(this.apiKey.trim(), this.pageId.trim());
      this.apiKey = '';
      this.pageId = '';
      await this.refreshStatus();
    } catch (e) {
      this.connectError.set(e instanceof Error ? e.message : 'Connexion impossible');
    } finally {
      this.connectLoading.set(false);
    }
  }

  async handleDisconnect(): Promise<void> {
    await this.notionApi.disconnect();
    this.status.set(null);
    await this.refreshStatus();
  }

  async handleSetup(): Promise<void> {
    this.syncState.set('syncing');
    this.syncMessage.set('Création des bases Notion...');
    try {
      const result = await this.notionApi.setupDatabases();
      this.dbIds = {
        characters: result.databases.characters ?? '',
        races: result.databases.races ?? '',
        classes: result.databases.classes ?? '',
        spells: result.databases.spells ?? '',
        items: result.databases.items ?? '',
      };
      this.syncState.set('success');
      this.syncMessage.set('Bases de données créées avec succès !');
      await this.refreshStatus();
    } catch (e) {
      this.syncState.set('error');
      this.syncMessage.set(e instanceof Error ? e.message : 'Erreur lors de la création');
    }
  }

  async handleConfigure(): Promise<void> {
    this.syncState.set('syncing');
    this.syncMessage.set('Configuration des bases...');
    try {
      const result = await this.notionApi.configureDatabases(this.dbIds);
      const invalid = Object.entries(result.validations).filter(([, v]) => !v);
      if (invalid.length > 0) {
        this.syncState.set('error');
        this.syncMessage.set(`Bases invalides: ${invalid.map(([k]) => k).join(', ')}`);
      } else {
        this.syncState.set('success');
        this.syncMessage.set('Configuration enregistrée !');
        await this.refreshStatus();
      }
    } catch (e) {
      this.syncState.set('error');
      this.syncMessage.set(e instanceof Error ? e.message : 'Erreur de configuration');
    }
  }

  async handleSyncFromNotion(): Promise<void> {
    if (this.syncState() === 'syncing') return;
    this.syncState.set('syncing');
    this.syncProgress.set(0);
    try {
      const results = await this.notionSync.syncAllFromNotion((msg, progress) => {
        this.syncMessage.set(msg);
        this.syncProgress.set(progress);
      });
      await this.gameDataState.loadAll();
      this.syncState.set('success');
      this.syncMessage.set(
        `Sync terminée : ${results.races} races, ${results.classes} classes, ${results.spells} sorts, ${results.items} objets`,
      );
      this.snackBar.open('Synchronisation réussie !', undefined, { duration: 3000 });
    } catch (e) {
      this.syncState.set('error');
      this.syncMessage.set(e instanceof Error ? e.message : 'Erreur de synchronisation');
    }
  }

  async handlePushCharacters(): Promise<void> {
    if (this.syncState() === 'syncing') return;
    this.syncState.set('syncing');
    this.syncProgress.set(0);
    try {
      const count = await this.notionSync.pushAllCharactersToNotion((msg, progress) => {
        this.syncMessage.set(msg);
        this.syncProgress.set(progress);
      });
      this.syncState.set('success');
      this.syncMessage.set(`${count} personnage(s) envoyé(s) vers Notion`);
      this.snackBar.open(`${count} personnage(s) exporté(s)`, undefined, { duration: 3000 });
    } catch (e) {
      this.syncState.set('error');
      this.syncMessage.set(e instanceof Error ? e.message : 'Erreur d\'exportation');
    }
  }
}
