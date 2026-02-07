import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveRace, deleteRace } from '../../services/storage/gameDataService';
import type { GameRace } from '../../services/storage/database';

interface RaceEditorProps {
  race: GameRace;
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

const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge'];

export function RaceEditor({ race, isNew, onSave, onCancel }: RaceEditorProps) {
  const [formData, setFormData] = useState<GameRace>({ ...race });
  const [newTrait, setNewTrait] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof GameRace, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAbilityBonusChange = (index: number, field: 'ability' | 'bonus', value: string | number) => {
    const newBonuses = [...formData.abilityBonuses];
    if (field === 'ability') {
      newBonuses[index] = { ...newBonuses[index], ability: value as string };
    } else {
      newBonuses[index] = { ...newBonuses[index], bonus: value as number };
    }
    handleChange('abilityBonuses', newBonuses);
  };

  const addAbilityBonus = () => {
    handleChange('abilityBonuses', [...formData.abilityBonuses, { ability: 'str', bonus: 1 }]);
  };

  const removeAbilityBonus = (index: number) => {
    handleChange('abilityBonuses', formData.abilityBonuses.filter((_, i) => i !== index));
  };

  const addTrait = () => {
    if (newTrait.trim()) {
      handleChange('traits', [...formData.traits, newTrait.trim()]);
      setNewTrait('');
    }
  };

  const removeTrait = (index: number) => {
    handleChange('traits', formData.traits.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      handleChange('languages', [...formData.languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    handleChange('languages', formData.languages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const raceToSave: GameRace = {
        ...formData,
        id: isNew ? uuidv4() : formData.id,
        source: formData.source || 'Homebrew',
      };
      await saveRace(raceToSave);
      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isNew && confirm(`Supprimer la race "${formData.name}" ?`)) {
      try {
        await deleteRace(formData.id);
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
          <h2>{isNew ? 'Nouvelle race' : `Modifier: ${race.name}`}</h2>
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
                placeholder="Nom de la race"
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

          <div className="form-row-3">
            <div className="form-group">
              <label>Vitesse (ft)</label>
              <input
                type="number"
                value={formData.speed}
                onChange={(e) => handleChange('speed', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Taille</label>
              <select
                value={formData.size}
                onChange={(e) => handleChange('size', e.target.value)}
              >
                {SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Vision nocturne (ft)</label>
              <input
                type="number"
                value={formData.darkvision || 0}
                onChange={(e) => handleChange('darkvision', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bonus de caractéristiques</label>
            <div className="ability-bonuses-list">
              {formData.abilityBonuses.map((ab, index) => (
                <div key={index} className="ability-bonus-row">
                  <select
                    value={ab.ability}
                    onChange={(e) => handleAbilityBonusChange(index, 'ability', e.target.value)}
                  >
                    {ABILITIES.map((ability) => (
                      <option key={ability.id} value={ability.id}>{ability.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={ab.bonus}
                    onChange={(e) => handleAbilityBonusChange(index, 'bonus', parseInt(e.target.value) || 0)}
                    min={-5}
                    max={5}
                  />
                  <button onClick={() => removeAbilityBonus(index)}>×</button>
                </div>
              ))}
              <button className="add-button" onClick={addAbilityBonus}>
                + Ajouter un bonus
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Traits raciaux</label>
            <div className="tags-list">
              {formData.traits.map((trait, index) => (
                <span key={index} className="tag">
                  {trait}
                  <button onClick={() => removeTrait(index)}>×</button>
                </span>
              ))}
            </div>
            <div className="tag-input-row">
              <input
                type="text"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                placeholder="Nom du trait"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
              />
              <button onClick={addTrait}>Ajouter</button>
            </div>
          </div>

          <div className="form-group">
            <label>Langues</label>
            <div className="tags-list">
              {formData.languages.map((lang, index) => (
                <span key={index} className="tag">
                  {lang}
                  <button onClick={() => removeLanguage(index)}>×</button>
                </span>
              ))}
            </div>
            <div className="tag-input-row">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Langue"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
              />
              <button onClick={addLanguage}>Ajouter</button>
            </div>
          </div>

          <div className="form-group">
            <label>Description (optionnel)</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description de la race..."
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
