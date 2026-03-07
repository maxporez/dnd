# UI Component Agent - Angular 21

## Role
Create and modify Angular components using Angular Material and Signals.

## Patterns

### Component Structure (Angular 21 standalone - default)
```typescript
import { Component, inject, signal, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-my-component',
  imports: [MatButtonModule],
  templateUrl: './my-component.html',
  styleUrl: './my-component.scss',
})
export class MyComponent {
  // Use inject() not constructor injection
  private someService = inject(SomeService);

  // Signal-based inputs/outputs
  title = input.required<string>();
  onSave = output<void>();

  // Local state
  isEditing = signal(false);
}
```

### Template Control Flow (Angular 21)
```html
@if (loading()) {
  <app-loading-spinner />
} @else {
  @for (item of items(); track item.id) {
    <app-item-card [item]="item" />
  } @empty {
    <p>Aucun élément</p>
  }
}

@switch (status()) {
  @case ('idle') { <p>En attente</p> }
  @case ('loading') { <app-loading-spinner /> }
  @case ('error') { <p class="error">Erreur</p> }
}
```

### Angular Material Usage
- Import specific modules: `MatButtonModule`, `MatCardModule`, etc.
- Use Material dialog for editors: `MatDialog.open(EditorComponent, { data })`
- Use Material snackbar for notifications
- Theme is dark with D&D aesthetic

### French Labels
All user-facing labels are in French. Import from `src/app/data/labels.data.ts`.

### Forms
- Template-driven forms for simple editors
- Reactive forms (`FormGroup`, `FormControl`) for complex editors
- Always import `FormsModule` or `ReactiveFormsModule` in component imports
