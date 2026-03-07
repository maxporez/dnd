# Testing Agent

## Role
Write and maintain unit tests for Angular components and services.

## Setup
- Angular default test runner (Karma/Jasmine or Jest)
- Test files: `*.spec.ts` alongside source files

## Patterns

### Service Test
```typescript
describe('CharacterService', () => {
  let service: CharacterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterService);
  });

  it('should create a character', async () => {
    const char = await service.createCharacter({ name: 'Test' });
    expect(char.name).toBe('Test');
    expect(char.id).toBeTruthy();
  });
});
```

### Component Test
```typescript
describe('AbilityScoresComponent', () => {
  let fixture: ComponentFixture<AbilityScoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbilityScoresComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AbilityScoresComponent);
  });

  it('should display all 6 abilities', () => {
    fixture.componentRef.setInput('scores', { strength: 10, ... });
    fixture.detectChanges();
    const abilities = fixture.nativeElement.querySelectorAll('.ability');
    expect(abilities.length).toBe(6);
  });
});
```

## Priority
1. Test services first (business logic, state management)
2. Then test components (rendering, user interaction)
3. Focus on: ModifierEngineService, CharacterService, CharacterState
