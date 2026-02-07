import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveItem, deleteItem } from '../../services/storage/gameDataService';
import type { GameItem } from '../../services/storage/database';

interface ItemEditorProps {
  item: GameItem;
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const ITEM_CATEGORIES = [
  { id: 'weapon', name: 'Arme' },
  { id: 'armor', name: 'Armure' },
  { id: 'adventuring-gear', name: 'Équipement d\'aventurier' },
  { id: 'tools', name: 'Outils' },
  { id: 'mounts-and-vehicles', name: 'Montures et véhicules' },
  { id: 'magic-item', name: 'Objet magique' },
];

const WEAPON_CATEGORIES = ['Simple', 'Martial'];
const WEAPON_RANGES = ['Melee', 'Ranged'];
const ARMOR_CATEGORIES = ['Light', 'Medium', 'Heavy', 'Shield'];
const DAMAGE_TYPES = ['Bludgeoning', 'Piercing', 'Slashing', 'Acid', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Poison', 'Psychic', 'Radiant', 'Thunder'];
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'];
const CURRENCY_UNITS = ['cp', 'sp', 'ep', 'gp', 'pp'];

const WEAPON_PROPERTIES = [
  'Ammunition', 'Finesse', 'Heavy', 'Light', 'Loading', 'Range', 'Reach',
  'Special', 'Thrown', 'Two-Handed', 'Versatile'
];

export function ItemEditor({ item, isNew, onSave, onCancel }: ItemEditorProps) {
  const [formData, setFormData] = useState<GameItem>({ ...item });
  const [newProperty, setNewProperty] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof GameItem, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCostChange = (field: 'quantity' | 'unit', value: number | string) => {
    setFormData((prev) => ({
      ...prev,
      cost: {
        quantity: field === 'quantity' ? (value as number) : (prev.cost?.quantity || 0),
        unit: field === 'unit' ? (value as string) : (prev.cost?.unit || 'gp'),
      },
    }));
  };

  const handleDamageChange = (field: 'dice' | 'type', value: string) => {
    setFormData((prev) => ({
      ...prev,
      damage: {
        dice: field === 'dice' ? value : (prev.damage?.dice || '1d6'),
        type: field === 'type' ? value : (prev.damage?.type || 'Slashing'),
      },
    }));
  };

  const handleArmorClassChange = (field: 'base' | 'dexBonus' | 'maxBonus', value: number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      armorClass: {
        base: field === 'base' ? (value as number) : (prev.armorClass?.base || 10),
        dexBonus: field === 'dexBonus' ? (value as boolean) : (prev.armorClass?.dexBonus ?? true),
        maxBonus: field === 'maxBonus' ? (value as number) : prev.armorClass?.maxBonus,
      },
    }));
  };

  const addProperty = () => {
    if (newProperty && !formData.properties?.includes(newProperty)) {
      handleChange('properties', [...(formData.properties || []), newProperty]);
      setNewProperty('');
    }
  };

  const removeProperty = (index: number) => {
    handleChange('properties', formData.properties?.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const itemToSave: GameItem = {
        ...formData,
        id: isNew ? uuidv4() : formData.id,
        source: formData.source || 'Homebrew',
      };
      await saveItem(itemToSave);
      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isNew && confirm(`Supprimer l'objet "${formData.name}" ?`)) {
      try {
        await deleteItem(formData.id);
        onSave();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const isWeapon = formData.category === 'weapon';
  const isArmor = formData.category === 'armor';
  const isMagicItem = formData.category === 'magic-item';

  return (
    <div className="editor-overlay" onClick={onCancel}>
      <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
        <header className="editor-header">
          <h2>{isNew ? 'Nouvel objet' : `Modifier: ${item.name}`}</h2>
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
                placeholder="Nom de l'objet"
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
            <label>Catégorie</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Prix</label>
              <input
                type="number"
                value={formData.cost?.quantity || 0}
                onChange={(e) => handleCostChange('quantity', parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="form-group">
              <label>Unité</label>
              <select
                value={formData.cost?.unit || 'gp'}
                onChange={(e) => handleCostChange('unit', e.target.value)}
              >
                {CURRENCY_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Poids (lb)</label>
              <input
                type="number"
                value={formData.weight || 0}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                min={0}
                step={0.1}
              />
            </div>
          </div>

          {/* Section Arme */}
          {isWeapon && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie d'arme</label>
                  <select
                    value={formData.weaponCategory || 'Simple'}
                    onChange={(e) => handleChange('weaponCategory', e.target.value)}
                  >
                    {WEAPON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Portée</label>
                  <select
                    value={formData.weaponRange || 'Melee'}
                    onChange={(e) => handleChange('weaponRange', e.target.value)}
                  >
                    {WEAPON_RANGES.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dégâts</label>
                  <input
                    type="text"
                    value={formData.damage?.dice || '1d6'}
                    onChange={(e) => handleDamageChange('dice', e.target.value)}
                    placeholder="1d6"
                  />
                </div>
                <div className="form-group">
                  <label>Type de dégâts</label>
                  <select
                    value={formData.damage?.type || 'Slashing'}
                    onChange={(e) => handleDamageChange('type', e.target.value)}
                  >
                    {DAMAGE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Propriétés</label>
                <div className="tags-list">
                  {formData.properties?.map((prop, index) => (
                    <span key={index} className="tag">
                      {prop}
                      <button onClick={() => removeProperty(index)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="tag-input-row">
                  <select value={newProperty} onChange={(e) => setNewProperty(e.target.value)}>
                    <option value="">Choisir...</option>
                    {WEAPON_PROPERTIES.filter((p) => !formData.properties?.includes(p)).map((prop) => (
                      <option key={prop} value={prop}>{prop}</option>
                    ))}
                  </select>
                  <button onClick={addProperty} disabled={!newProperty}>Ajouter</button>
                </div>
              </div>
            </>
          )}

          {/* Section Armure */}
          {isArmor && (
            <>
              <div className="form-group">
                <label>Catégorie d'armure</label>
                <select
                  value={formData.armorCategory || 'Light'}
                  onChange={(e) => handleChange('armorCategory', e.target.value)}
                >
                  {ARMOR_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>CA de base</label>
                  <input
                    type="number"
                    value={formData.armorClass?.base || 10}
                    onChange={(e) => handleArmorClassChange('base', parseInt(e.target.value) || 10)}
                    min={0}
                  />
                </div>
                <div className="form-group">
                  <label>Bonus Dex max</label>
                  <input
                    type="number"
                    value={formData.armorClass?.maxBonus ?? ''}
                    onChange={(e) => handleArmorClassChange('maxBonus', parseInt(e.target.value) || 0)}
                    min={0}
                    placeholder="Aucun"
                  />
                </div>
                <div className="form-group">
                  <label>Force min</label>
                  <input
                    type="number"
                    value={formData.strengthRequirement || 0}
                    onChange={(e) => handleChange('strengthRequirement', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.armorClass?.dexBonus ?? true}
                    onChange={(e) => handleArmorClassChange('dexBonus', e.target.checked)}
                  />
                  Ajoute bonus de Dex à la CA
                </label>
              </div>

              <div className="form-group">
                <label className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.stealthDisadvantage || false}
                    onChange={(e) => handleChange('stealthDisadvantage', e.target.checked)}
                  />
                  Désavantage en Discrétion
                </label>
              </div>
            </>
          )}

          {/* Section Objet magique */}
          {isMagicItem && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Rareté</label>
                  <select
                    value={formData.rarity || 'Common'}
                    onChange={(e) => handleChange('rarity', e.target.value)}
                  >
                    {RARITIES.map((rarity) => (
                      <option key={rarity} value={rarity}>{rarity}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Bonus magique</label>
                  <input
                    type="number"
                    value={formData.magicBonus || 0}
                    onChange={(e) => handleChange('magicBonus', parseInt(e.target.value) || 0)}
                    min={0}
                    max={3}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.requiresAttunement || false}
                    onChange={(e) => handleChange('requiresAttunement', e.target.checked)}
                  />
                  Nécessite harmonisation
                </label>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description de l'objet..."
              style={{ minHeight: '100px' }}
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
