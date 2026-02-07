import { useParams, useNavigate } from 'react-router-dom';
import { useCharacter } from '../hooks/useCharacter';
import { AbilityScoresDisplay } from '../components/AbilityScores';
import { RACES, CLASSES, calculateTotalHitPoints } from '../data/base';
import type { AbilityName, SkillName, SkillProficiencies } from '../types';
import './CharacterSheet.css';

const SKILL_LABELS: Record<SkillName, string> = {
  acrobatics: 'Acrobaties',
  animalHandling: 'Dressage',
  arcana: 'Arcanes',
  athletics: 'Athlétisme',
  deception: 'Tromperie',
  history: 'Histoire',
  insight: 'Perspicacité',
  intimidation: 'Intimidation',
  investigation: 'Investigation',
  medicine: 'Médecine',
  nature: 'Nature',
  perception: 'Perception',
  performance: 'Représentation',
  persuasion: 'Persuasion',
  religion: 'Religion',
  sleightOfHand: 'Escamotage',
  stealth: 'Discrétion',
  survival: 'Survie',
};

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'Force',
  dexterity: 'Dextérité',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Sagesse',
  charisma: 'Charisme',
};

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { character, loading, error, saveCharacter } = useCharacter(id || null);

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error || !character) {
    return (
      <div className="error">
        <p>{error || 'Personnage non trouvé'}</p>
        <button onClick={() => navigate('/')}>Retour à la liste</button>
      </div>
    );
  }

  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0) || 1;

  // Handlers
  const handleAbilityChange = (ability: AbilityName, value: number) => {
    saveCharacter({
      baseAbilityScores: {
        ...character.baseAbilityScores,
        [ability]: value,
      },
    });
  };

  const handleNameChange = (name: string) => {
    saveCharacter({ name });
  };

  const handleHpChange = (hp: number) => {
    saveCharacter({
      currentState: {
        ...character.currentState,
        hitPoints: hp,
      },
    });
  };

  const handleRaceChange = (raceId: string) => {
    const race = RACES.find((r) => r.id === raceId);
    if (race) {
      saveCharacter({
        race: {
          raceId: race.id,
          raceName: race.name,
          isHomebrew: false,
        },
        activeModifiers: [
          ...character.activeModifiers.filter((m) => m.source !== 'race' && m.source !== 'subrace'),
          ...race.modifiers,
        ],
      });
    }
  };

  const handleClassChange = (classId: string) => {
    const cls = CLASSES.find((c) => c.id === classId);
    if (cls) {
      // Calculer les HP avec la nouvelle classe
      const conMod = character.abilityModifiers.constitution;
      const hp = calculateTotalHitPoints([{ classId: cls.id, level: 1 }], conMod);

      saveCharacter({
        classes: [
          {
            classId: cls.id,
            className: cls.name,
            level: 1,
            isHomebrew: false,
          },
        ],
        savingThrowProficiencies: {
          strength: cls.savingThrows.includes('strength'),
          dexterity: cls.savingThrows.includes('dexterity'),
          constitution: cls.savingThrows.includes('constitution'),
          intelligence: cls.savingThrows.includes('intelligence'),
          wisdom: cls.savingThrows.includes('wisdom'),
          charisma: cls.savingThrows.includes('charisma'),
        },
        currentState: {
          ...character.currentState,
          hitPoints: hp,
        },
      });
    }
  };

  const handleLevelChange = (level: number) => {
    if (character.classes.length > 0) {
      const classId = character.classes[0].classId;
      const conMod = character.abilityModifiers.constitution;
      const hp = calculateTotalHitPoints([{ classId, level }], conMod);

      saveCharacter({
        classes: [
          {
            ...character.classes[0],
            level,
          },
        ],
        currentState: {
          ...character.currentState,
          hitPoints: hp,
        },
      });
    }
  };

  const handleSkillToggle = (skill: SkillName) => {
    const current = character.skillProficiencies[skill] || 'none';
    const next: SkillProficiencies[string] =
      current === 'none' ? 'proficient' : current === 'proficient' ? 'expert' : 'none';

    saveCharacter({
      skillProficiencies: {
        ...character.skillProficiencies,
        [skill]: next,
      },
    });
  };

  const handleSaveToggle = (ability: AbilityName) => {
    saveCharacter({
      savingThrowProficiencies: {
        ...character.savingThrowProficiencies,
        [ability]: !character.savingThrowProficiencies[ability],
      },
    });
  };

  return (
    <div className="character-sheet">
      {/* Header */}
      <header className="sheet-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Retour
        </button>
        <input
          type="text"
          className="character-name"
          value={character.name || 'Nouveau personnage'}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Nom du personnage"
        />
      </header>

      {/* Info de base avec sélecteurs */}
      <section className="basic-info">
        <div className="info-row">
          <span className="label">Race:</span>
          <select
            className="select-input"
            value={character.race.raceId || ''}
            onChange={(e) => handleRaceChange(e.target.value)}
          >
            <option value="">-- Choisir --</option>
            {RACES.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name}
              </option>
            ))}
          </select>
        </div>
        <div className="info-row">
          <span className="label">Classe:</span>
          <select
            className="select-input"
            value={character.classes[0]?.classId || ''}
            onChange={(e) => handleClassChange(e.target.value)}
          >
            <option value="">-- Choisir --</option>
            {CLASSES.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <div className="info-row">
          <span className="label">Niveau:</span>
          <input
            type="number"
            className="level-input"
            value={totalLevel}
            onChange={(e) => handleLevelChange(parseInt(e.target.value) || 1)}
            min={1}
            max={20}
          />
        </div>
        <div className="info-row">
          <span className="label">Background:</span>
          <span className="value">{character.background.backgroundName || 'Non défini'}</span>
        </div>
      </section>

      {/* Stats principales */}
      <section className="main-stats">
        <div className="stat-box">
          <span className="stat-label">CA</span>
          <span className="stat-value">{character.derivedStats.armorClass}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Initiative</span>
          <span className="stat-value">{formatModifier(character.derivedStats.initiative)}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Vitesse</span>
          <span className="stat-value">{character.derivedStats.speed} m</span>
        </div>
        <div className="stat-box hp-box">
          <span className="stat-label">PV</span>
          <div className="hp-display">
            <input
              type="number"
              className="hp-current"
              value={character.derivedStats.hitPointsCurrent}
              onChange={(e) => handleHpChange(parseInt(e.target.value) || 0)}
            />
            <span className="hp-separator">/</span>
            <span className="hp-max">{character.derivedStats.hitPointsMax}</span>
          </div>
        </div>
      </section>

      {/* Caractéristiques */}
      <section className="abilities-section">
        <h2>Caractéristiques</h2>
        <AbilityScoresDisplay
          scores={character.computedAbilityScores}
          modifiers={character.abilityModifiers}
          onScoreChange={handleAbilityChange}
          editable={true}
        />
      </section>

      {/* Compétences (cliquables) */}
      <section className="skills-section">
        <h2>Compétences <span className="hint">(cliquer pour changer)</span></h2>
        <div className="skills-list">
          {(Object.keys(SKILL_LABELS) as SkillName[]).sort().map((skill) => {
            const bonus = character.computedSkillBonuses[skill] || 0;
            const proficiency = character.skillProficiencies[skill] || 'none';
            const profIcon = proficiency === 'expert' ? '◆' : proficiency === 'proficient' ? '●' : '○';

            return (
              <div
                key={skill}
                className={`skill-row ${proficiency} clickable`}
                onClick={() => handleSkillToggle(skill)}
              >
                <span className="skill-prof">{profIcon}</span>
                <span className="skill-bonus">{formatModifier(bonus)}</span>
                <span className="skill-name">{SKILL_LABELS[skill]}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Jets de sauvegarde (cliquables) */}
      <section className="saves-section">
        <h2>Jets de sauvegarde <span className="hint">(cliquer pour changer)</span></h2>
        <div className="saves-list">
          {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map(
            (ability) => {
              const bonus = character.computedSaveBonuses[ability] || 0;
              const proficient = character.savingThrowProficiencies[ability];

              return (
                <div
                  key={ability}
                  className={`save-row ${proficient ? 'proficient' : ''} clickable`}
                  onClick={() => handleSaveToggle(ability)}
                >
                  <span className="save-prof">{proficient ? '●' : '○'}</span>
                  <span className="save-bonus">{formatModifier(bonus)}</span>
                  <span className="save-name">{ABILITY_LABELS[ability]}</span>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* Bonus de maîtrise */}
      <section className="proficiency-section">
        <div className="proficiency-bonus">
          <span className="label">Bonus de maîtrise</span>
          <span className="value">{formatModifier(character.derivedStats.proficiencyBonus)}</span>
        </div>
      </section>

      {/* Perception passive */}
      <section className="passive-section">
        <div className="passive-stat">
          <span className="label">Perception passive</span>
          <span className="value">{character.derivedStats.passivePerception}</span>
        </div>
      </section>
    </div>
  );
}
