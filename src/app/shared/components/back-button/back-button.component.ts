import { Component, input } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-icon-button (click)="goBack()" [attr.aria-label]="label()">
      <mat-icon>arrow_back</mat-icon>
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }
  `,
})
export class BackButtonComponent {
  label = input('Retour');

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
