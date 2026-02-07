import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveSpell, deleteSpell } from '../../services/storage/gameDataService';
import type { GameSpell } from '../../services/storage/database';

interface SpellEditorProps {
  spell: GameSpell;
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const SPELL_SCHOOLS = [
  { id: 'abjuration', name: 'Abjuration' },
  { id: 'conjuration', name: 'Conjuration' },
  { id: 'divination', name: 'Divination' },
  { id: 'enchantment', name: 'Enchantement' },
  { id: 'evocation', name: 'Évocation' },
  { id: 'illusion', name: 'Illusion' },
  { id: 'necromancy', name: 'Nécromancie' },
  { id: 'transmutation', name: 'Transmutation' },
];

const SPELL_LEVELS = [
  { value: 0, label: 'Tour de magie' },
  { value: 1, label: 'Niveau 1' },
  { value: 2, label: 'Niveau 2' },
  { value: 3, label: 'Niveau 3' },
  { value: 4, label: 'Niveau 4' },
  { value: 5, label: 'Niveau 5' },
  { value: 6, label: 'Niveau 6' },
  { value: 7, label: 'Niveau 7' },
  { value: 8, label: 'Niveau 8' },
  { value: 9, label: 'Niveau 9' },
];

const CLASSES = [
  'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'
];

const CLASS_LABELS: Record<string, string> = {
  bard: 'Barde',
  cleric: 'Clerc',
  druid: 'Druide',
  paladin: 'Paladin',
  ranger: 'Rôdeur',
  sorcerer: 'Ensorceleur',
  warlock: 'Occultiste',
  wizard: 'Magicien',
};

export function SpellEditor({ spell, isNew, onSave, onCancel }: SpellEditorProps) {
  const [formData, setFormData] = useState<GameSpell>({ ...spell });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof GameSpell, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleComponentChange = (component: 'verbal' | 'somatic', value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      components: { ...prev.components, [component]: value },
    }));
  };

  const handleMaterialChange = (material: string) => {
    setFormData((prev) => ({
      ...prev,
      components: { ...prev.components, material: material || undefined },
    }));
  };

  const toggleClass = (classId: string) => {
    const current = formData.classes;
    if (current.includes(classId)) {
      handleChange('classes', current.filter((c) => c !== classId));
    } else {
      handleChange('classes', [...current, classId]);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const spellToSave: GameSpell = {
        ...formData,
        id: isNew ? uuidv4() : formData.id,
        source: formData.source || 'Homebrew',
      };
      await saveSpell(spellToSave);
      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isNew && confirm(`Supprimer le sort "${formData.name}" ?`)) {
      try {
        await deleteSpell(formData.id);
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
          <h2>{isNew ? 'Nouveau sort' : `Modifier: ${spell.name}`}</h2>
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
                placeholder="Nom du sort"
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

          <div className="form-row">
            <div className="form-group">
              <label>Niveau</label>
              <select
                value={formData.level}
                onChange={(e) => handleChange('level', parseInt(e.target.value))}
              >
                {SPELL_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>École</label>
              <select
                value={formData.school}
                onChange={(e) => handleChange('school', e.target.value)}
              >
                {SPELL_SCHOOLS.map((school) => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Temps d'incantation</label>
              <input
                type="text"
                value={formData.castingTime}
                onChange={(e) => handleChange('castingTime', e.target.value)}
                placeholder="1 action"
              />
            </div>
            <div className="form-group">
              <label>Portée</label>
              <input
                type="text"
                value={formData.range}
                onChange={(e) => handleChange('range', e.target.value)}
                placeholder="30 feet"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Durée</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              placeholder="Instantaneous"
            />
          </div>

          <div className="form-group">
            <label>Composantes</label>
            <div className="skill-checkboxes" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <label className="skill-checkbox">
                <input
                  type="checkbox"
                  checked={formData.components.verbal}
                  onChange={(e) => handleComponentChange('verbal', e.target.checked)}
                />
                Verbale (V)
              </label>
              <label className="skill-checkbox">
                <input
                  type="checkbox"
                  checked={formData.components.somatic}
                  onChange={(e) => handleComponentChange('somatic', e.target.checked)}
                />
                Somatique (S)
              </label>
            </div>
            <input
              type="text"
              value={formData.components.material || ''}
              onChange={(e) => handleMaterialChange(e.target.value)}
              placeholder="Composante matérielle (optionnel)"
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          <div className="form-group">
            <label>Classes</label>
            <div className="skill-checkboxes">
              {CLASSES.map((cls) => (
                <label key={cls} className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.classes.includes(cls)}
                    onChange={() => toggleClass(cls)}
                  />
                  {CLASS_LABELS[cls] || cls}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description du sort..."
              style={{ minHeight: '120px' }}
            />
          </div>

          <div className="form-group">
            <label>À niveaux supérieurs (optionnel)</label>
            <textarea
              value={formData.higherLevels || ''}
              onChange={(e) => handleChange('higherLevels', e.target.value)}
              placeholder="Effets à niveaux supérieurs..."
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
