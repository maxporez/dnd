import { Component, inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  warn?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">
        {{ data.cancelText || 'Annuler' }}
      </button>
      <button
        mat-flat-button
        [color]="data.warn ? 'warn' : 'primary'"
        (click)="dialogRef.close(true)"
      >
        {{ data.confirmText || 'Confirmer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content p {
      color: var(--ink-secondary);
      line-height: 1.5;
    }
  `,
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}
