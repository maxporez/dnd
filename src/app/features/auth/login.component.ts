import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

type Mode = 'login' | 'register' | 'magic';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card">

        <!-- En-tête -->
        <mat-card-header class="login-header">
          <mat-icon class="login-icon">auto_stories</mat-icon>
          <mat-card-title>D&D Grimoire</mat-card-title>
          <mat-card-subtitle>Gérez vos personnages de D&D 5.5</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>

          <!-- Onglets Connexion / Inscription -->
          <mat-tab-group animationDuration="200ms" (selectedIndexChange)="onTabChange($event)">

            <!-- ── Connexion ── -->
            <mat-tab label="Connexion">
              <div class="tab-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Adresse e-mail</mat-label>
                  <input matInput type="email" [(ngModel)]="email" placeholder="vous@exemple.com"
                         (keyup.enter)="handlePasswordAction()" autocomplete="email" />
                  <mat-icon matSuffix>email</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Mot de passe</mat-label>
                  <input matInput [type]="showPassword() ? 'text' : 'password'"
                         [(ngModel)]="password" (keyup.enter)="handlePasswordAction()"
                         autocomplete="current-password" />
                  <button mat-icon-button matSuffix type="button"
                          (click)="showPassword.set(!showPassword())">
                    <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </mat-form-field>

                @if (errorMsg()) {
                  <p class="error-msg">
                    <mat-icon>error_outline</mat-icon>
                    {{ errorMsg() }}
                  </p>
                }

                <button mat-raised-button color="primary" class="full-width action-btn"
                        [disabled]="submitting()" (click)="handlePasswordAction()">
                  @if (submitting()) {
                    <mat-spinner diameter="20" />
                  } @else {
                    <mat-icon>login</mat-icon>
                  }
                  @if (!submitting()) { Se connecter }
                </button>
              </div>
            </mat-tab>

            <!-- ── Inscription ── -->
            <mat-tab label="Créer un compte">
              <div class="tab-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Adresse e-mail</mat-label>
                  <input matInput type="email" [(ngModel)]="email" placeholder="vous@exemple.com"
                         (keyup.enter)="handlePasswordAction()" autocomplete="email" />
                  <mat-icon matSuffix>email</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Mot de passe</mat-label>
                  <input matInput [type]="showPassword() ? 'text' : 'password'"
                         [(ngModel)]="password" (keyup.enter)="handlePasswordAction()"
                         autocomplete="new-password" />
                  <button mat-icon-button matSuffix type="button"
                          (click)="showPassword.set(!showPassword())">
                    <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-hint>Au moins 6 caractères</mat-hint>
                </mat-form-field>

                @if (errorMsg()) {
                  <p class="error-msg">
                    <mat-icon>error_outline</mat-icon>
                    {{ errorMsg() }}
                  </p>
                }

                @if (successMsg()) {
                  <p class="success-msg">
                    <mat-icon>check_circle_outline</mat-icon>
                    {{ successMsg() }}
                  </p>
                }

                <button mat-raised-button color="primary" class="full-width action-btn"
                        [disabled]="submitting()" (click)="handlePasswordAction()">
                  @if (submitting()) {
                    <mat-spinner diameter="20" />
                  } @else {
                    <mat-icon>person_add</mat-icon>
                  }
                  @if (!submitting()) { Créer mon compte }
                </button>
              </div>
            </mat-tab>

          </mat-tab-group>

          <!-- ── Séparateur ── -->
          <div class="divider-row">
            <mat-divider />
            <span class="divider-label">ou</span>
            <mat-divider />
          </div>

          <!-- ── Lien magique ── -->
          @if (!magicLinkSent()) {
            <div class="magic-section">
              <p class="magic-hint">
                <mat-icon>auto_fix_high</mat-icon>
                Connexion sans mot de passe par e-mail
              </p>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Votre e-mail</mat-label>
                <input matInput type="email" [(ngModel)]="magicEmail"
                       placeholder="vous@exemple.com" (keyup.enter)="sendMagicLink()"
                       autocomplete="email" />
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>
              @if (magicError()) {
                <p class="error-msg">
                  <mat-icon>error_outline</mat-icon>
                  {{ magicError() }}
                </p>
              }
              <button mat-stroked-button class="full-width action-btn"
                      [disabled]="submitting()" (click)="sendMagicLink()">
                @if (submitting()) {
                  <mat-spinner diameter="20" />
                } @else {
                  <mat-icon>send</mat-icon>
                }
                @if (!submitting()) { Envoyer le lien magique }
              </button>
            </div>
          } @else {
            <div class="magic-sent">
              <mat-icon class="sent-icon">mark_email_read</mat-icon>
              <p>Lien envoyé à <strong>{{ magicEmail }}</strong></p>
              <p class="sent-hint">Vérifiez votre boîte mail et cliquez sur le lien pour vous connecter.</p>
              <button mat-button (click)="magicLinkSent.set(false)">Renvoyer</button>
            </div>
          }

        </mat-card-content>

      </mat-card>
    </div>
  `,
  styles: `
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: var(--mat-sys-surface-variant, #f5f5f5);
    }

    .login-card {
      width: 100%;
      max-width: 440px;
    }

    .login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 8px;
      text-align: center;
    }

    .login-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mat-sys-primary);
      margin-bottom: 8px;
    }

    .tab-content {
      padding: 16px 0 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .full-width {
      width: 100%;
    }

    .action-btn {
      margin-top: 8px;
      height: 44px;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .error-msg {
      color: var(--mat-sys-error);
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      margin: 0;
    }

    .success-msg {
      color: #2e7d32;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      margin: 0;
    }

    .divider-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0 16px;
    }

    .divider-row mat-divider {
      flex: 1;
    }

    .divider-label {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
      white-space: nowrap;
    }

    .magic-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .magic-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
      margin: 0 0 8px;
    }

    .magic-sent {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px 0;
      gap: 4px;
    }

    .sent-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #2e7d32;
    }

    .sent-hint {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Formulaire
  email = '';
  password = '';
  magicEmail = '';

  // État UI
  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly errorMsg = signal('');
  readonly successMsg = signal('');
  readonly magicError = signal('');
  readonly magicLinkSent = signal(false);

  // Onglet actif (0 = connexion, 1 = inscription)
  private tabIndex = 0;

  onTabChange(index: number): void {
    this.tabIndex = index;
    this.errorMsg.set('');
    this.successMsg.set('');
  }

  async handlePasswordAction(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMsg.set('Veuillez remplir tous les champs.');
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    try {
      if (this.tabIndex === 0) {
        // Connexion
        const { error } = await this.auth.signInWithEmail(this.email, this.password);
        if (error) {
          this.errorMsg.set(this.translateError(error.message));
        } else {
          this.redirectAfterLogin();
        }
      } else {
        // Inscription
        const { error } = await this.auth.signUpWithEmail(this.email, this.password);
        if (error) {
          this.errorMsg.set(this.translateError(error.message));
        } else {
          this.successMsg.set('Compte créé ! Vérifiez votre e-mail pour confirmer puis connectez-vous.');
        }
      }
    } finally {
      this.submitting.set(false);
    }
  }

  async sendMagicLink(): Promise<void> {
    if (!this.magicEmail) {
      this.magicError.set('Veuillez entrer votre adresse e-mail.');
      return;
    }

    this.submitting.set(true);
    this.magicError.set('');

    try {
      const { error } = await this.auth.signInWithMagicLink(this.magicEmail);
      if (error) {
        this.magicError.set(this.translateError(error.message));
      } else {
        this.magicLinkSent.set(true);
      }
    } finally {
      this.submitting.set(false);
    }
  }

  private redirectAfterLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    this.router.navigateByUrl(returnUrl);
  }

  private translateError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
    if (msg.includes('Email not confirmed')) return 'Confirmez votre e-mail avant de vous connecter.';
    if (msg.includes('User already registered')) return 'Un compte existe déjà avec cet e-mail.';
    if (msg.includes('Password should be')) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (msg.includes('rate limit')) return 'Trop de tentatives. Attendez quelques minutes.';
    return msg;
  }
}
