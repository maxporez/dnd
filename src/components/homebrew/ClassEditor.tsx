import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveClass, deleteClass } from '../../services/storage/gameDataService';
import type { GameClass } from '../../services/storage/database';

interface ClassEditorProps {
  gameClass: GameClass;
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const ABILITIES = [
  { id: 'str', name: 'Force' },
  { id: 'dex', name: 'Dextérité' },
  { id: 'con', name: 'Constitution' },
  { id: 'int', name: 'Intelligence' },
  { id: 'wis', name: 'Sagesse' },
  { id: 'cha', name: 'Charisme' },
];

const SKILLS = [
  { id: 'acrobatics', name: 'Acrobaties' },
  { id: 'animalHandling', name: 'Dressage' },
  { id: 'arcana', name: 'Arcanes' },
  { id: 'athletics', name: 'Athlétisme' },
  { id: 'deception', name: 'Tromperie' },
  { id: 'history', name: 'Histoire' },
  { id: 'insight', name: 'Perspicacité' },
  { id: 'intimidation', name: 'Intimidation' },
  { id: 'investigation', name: 'Investigation' },
  { id: 'medicine', name: 'Médecine' },
  { id: 'nature', name: 'Nature' },
  { id: 'perception', name: 'Perception' },
  { id: 'performance', name: 'Représentation' },
  { id: 'persuasion', name: 'Persuasion' },
  { id: 'religion', name: 'Religion' },
  { id: 'sleightOfHand', name: 'Escamotage' },
  { id: 'stealth', name: 'Discrétion' },
  { id: 'survival', name: 'Survie' },
];

const HIT_DICE = [6, 8, 10, 12];

const ARMOR_TYPES = ['Light', 'Medium', 'Heavy', 'Shields'];
const WEAPON_TYPES = ['Simple', 'Martial', 'Specific weapons'];
const SPELLCASTING_TYPES = ['Full', 'Half', 'Third', 'Pact Magic'];

export function ClassEditor({ gameClass, isNew, onSave, onCancel }: ClassEditorProps) {
  const [formData, setFormData] = useState<GameClass>({ ...gameClass });
  const [newArmor, setNewArmor] = useState('');
  const [newWeapon, setNewWeapon] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof GameClass, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePrimaryAbility = (abilityId: string) => {
    const current = formData.primaryAbility;
    if (current.includes(abilityId)) {
      handleChange('primaryAbility', current.filter((a) => a !== abilityId));
    } else {
      handleChange('primaryAbility', [...current, abilityId]);
    }
  };

  const toggleSavingThrow = (abilityId: string) => {
    const current = formData.savingThrows;
    if (current.includes(abilityId)) {
      handleChange('savingThrows', current.filter((a) => a !== abilityId));
    } else if (current.length < 2) {
      handleChange('savingThrows', [...current, abilityId]);
    }
  };

  const toggleSkillChoice = (skillId: string) => {
    const current = formData.skillChoices.from;
    if (current.includes(skillId)) {
      handleChange('skillChoices', {
        ...formData.skillChoices,
        from: current.filter((s) => s !== skillId),
      });
    } else {
      handleChange('skillChoices', {
        ...formData.skillChoices,
        from: [...current, skillId],
      });
    }
  };

  const handleSkillCountChange = (count: number) => {
    handleChange('skillChoices', {
      ...formData.skillChoices,
      count: Math.max(1, Math.min(count, formData.skillChoices.from.length)),
    });
  };

  const addArmorProficiency = () => {
    if (newArmor.trim() && !formData.armorProficiencies.includes(newArmor.trim())) {
      handleChange('armorProficiencies', [...formData.armorProficiencies, newArmor.trim()]);
      setNewArmor('');
    }
  };

  const removeArmorProficiency = (index: number) => {
    handleChange('armorProficiencies', formData.armorProficiencies.filter((_, i) => i !== index));
  };

  const addWeaponProficiency = () => {
    if (newWeapon.trim() && !formData.weaponProficiencies.includes(newWeapon.trim())) {
      handleChange('weaponProficiencies', [...formData.weaponProficiencies, newWeapon.trim()]);
      setNewWeapon('');
    }
  };

  const removeWeaponProficiency = (index: number) => {
    handleChange('weaponProficiencies', formData.weaponProficiencies.filter((_, i) => i !== index));
  };

  const handleSpellcastingChange = (hasSpellcasting: boolean) => {
    if (hasSpellcasting) {
      handleChange('spellcasting', { ability: 'int', type: 'Full' });
    } else {
      handleChange('spellcasting', undefined);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const classToSave: GameClass = {
        ...formData,
        id: isNew ? uuidv4() : formData.id,
        source: formData.source || 'Homebrew',
      };
      await saveClass(classToSave);
      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isNew && confirm(`Supprimer la classe "${formData.name}" ?`)) {
      try {
        await deleteClass(formData.id);
        onSave();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  return (
    <div className="editor-overlay" onClick={onCancel}>
      <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
        <header className="editor-header">
          <h2>{isNew ? 'Nouvelle classe' : `Modifier: ${gameClass.name}`}</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </header>

        <div className="editor-body">
          <div className="form-row">
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nom de la classe"
              />
            </div>
            <div className="form-group">
              <label>Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
                placeholder="Homebrew"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dé de vie</label>
            <select
              value={formData.hitDie}
              onChange={(e) => handleChange('hitDie', parseInt(e.target.value))}
            >
              {HIT_DICE.map((die) => (
                <option key={die} value={die}>d{die}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Caractéristiques principales</label>
            <div className="skill-checkboxes">
              {ABILITIES.map((ability) => (
                <label key={ability.id} className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.primaryAbility.includes(ability.id)}
                    onChange={() => togglePrimaryAbility(ability.id)}
                  />
                  {ability.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Jets de sauvegarde maîtrisés (max 2)</label>
            <div className="skill-checkboxes">
              {ABILITIES.map((ability) => (
                <label key={ability.id} className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.savingThrows.includes(ability.id)}
                    onChange={() => toggleSavingThrow(ability.id)}
                    disabled={!formData.savingThrows.includes(ability.id) && formData.savingThrows.length >= 2}
                  />
                  {ability.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Maîtrises d'armures</label>
            <div className="tags-list">
              {formData.armorProficiencies.map((armor, index) => (
                <span key={index} className="tag">
                  {armor}
                  <button onClick={() => removeArmorProficiency(index)}>×</button>
                </span>
              ))}
            </div>
            <div className="tag-input-row">
              <select value={newArmor} onChange={(e) => setNewArmor(e.target.value)}>
                <option value="">Choisir...</option>
                {ARMOR_TYPES.filter((a) => !formData.armorProficiencies.includes(a)).map((armor) => (
                  <option key={armor} value={armor}>{armor}</option>
                ))}
              </select>
              <button onClick={addArmorProficiency} disabled={!newArmor}>Ajouter</button>
            </div>
          </div>

          <div className="form-group">
            <label>Maîtrises d'armes</label>
            <div className="tags-list">
              {formData.weaponProficiencies.map((weapon, index) => (
                <span key={index} className="tag">
                  {weapon}
                  <button onClick={() => removeWeaponProficiency(index)}>×</button>
                </span>
              ))}
            </div>
            <div className="tag-input-row">
              <select value={newWeapon} onChange={(e) => setNewWeapon(e.target.value)}>
                <option value="">Choisir...</option>
                {WEAPON_TYPES.filter((w) => !formData.weaponProficiencies.includes(w)).map((weapon) => (
                  <option key={weapon} value={weapon}>{weapon}</option>
                ))}
              </select>
              <button onClick={addWeaponProficiency} disabled={!newWeapon}>Ajouter</button>
            </div>
          </div>

          <div className="form-group skill-choices-section">
            <label>Choix de compétences</label>
            <div className="skill-choices-header">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="number"
                  value={formData.skillChoices.count}
                  onChange={(e) => handleSkillCountChange(parseInt(e.target.value) || 1)}
                  min={1}
                  max={formData.skillChoices.from.length || 10}
                  style={{ width: '70px' }}
                />
              </div>
            </div>
            <div className="skill-checkboxes">
              {SKILLS.map((skill) => (
                <label key={skill.id} className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.skillChoices.from.includes(skill.id)}
                    onChange={() => toggleSkillChoice(skill.id)}
                  />
                  {skill.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={!!formData.spellcasting}
                onChange={(e) => handleSpellcastingChange(e.target.checked)}
                style={{ width: 'auto', marginRight: '0.5rem' }}
              />
              Classe de lanceur de sorts
            </label>
          </div>

          {formData.spellcasting && (
            <div className="form-row">
              <div className="form-group">
                <label>Caractéristique d'incantation</label>
                <select
                  value={formData.spellcasting.ability}
                  onChange={(e) => handleChange('spellcasting', { ...formData.spellcasting!, ability: e.target.value })}
                >
                  {ABILITIES.map((ability) => (
                    <option key={ability.id} value={ability.id}>{ability.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Type d'incantation</label>
                <select
                  value={formData.spellcasting.type}
                  onChange={(e) => handleChange('spellcasting', { ...formData.spellcasting!, type: e.target.value })}
                >
                  {SPELLCASTING_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Description (optionnel)</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description de la classe..."
            />
          </div>
        </div>

        <footer className="editor-footer">
          <div className="editor-footer-left">
            {!isNew && (
              <button className="delete-button" onClick={handleDelete}>
                Supprimer
              </button>
            )}
          </div>
          <div className="editor-footer-right">
            <button className="cancel-button" onClick={onCancel}>
              Annuler
            </button>
            <button
              className="save-button"
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
