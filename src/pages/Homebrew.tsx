import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameData } from '../hooks/useGameData';
import { RaceEditor } from '../components/homebrew/RaceEditor';
import { ClassEditor } from '../components/homebrew/ClassEditor';
import { SpellEditor } from '../components/homebrew/SpellEditor';
import { ItemEditor } from '../components/homebrew/ItemEditor';
import { importHerbs } from '../services/data';
import type { GameRace, GameClass, GameSpell, GameItem } from '../services/storage/database';
import './Homebrew.css';

type Tab = 'races' | 'classes' | 'spells' | 'items';

const SCHOOL_LABELS: Record<string, string> = {
  abjuration: 'Abjuration',
  conjuration: 'Conjuration',
  divination: 'Divination',
  enchantment: 'Enchantement',
  evocation: 'Évocation',
  illusion: 'Illusion',
  necromancy: 'Nécromancie',
  transmutation: 'Transmutation',
};

const CATEGORY_LABELS: Record<string, string> = {
  weapon: 'Arme',
  armor: 'Armure',
  'adventuring-gear': 'Équipement',
  tools: 'Outils',
  'mounts-and-vehicles': 'Montures',
  'magic-item': 'Objet magique',
  herb: 'Herbe',
};

export function Homebrew() {
  const navigate = useNavigate();
  const { races, classes, spells, items, isLoading, refreshData } = useGameData();
  const [activeTab, setActiveTab] = useState<Tab>('races');
  const [editingRace, setEditingRace] = useState<GameRace | null>(null);
  const [editingClass, setEditingClass] = useState<GameClass | null>(null);
  const [editingSpell, setEditingSpell] = useState<GameSpell | null>(null);
  const [editingItem, setEditingItem] = useState<GameItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportingHerbs, setIsImportingHerbs] = useState(false);
  const [herbsImportMessage, setHerbsImportMessage] = useState<string | null>(null);

  const handleImportHerbs = async () => {
    setIsImportingHerbs(true);
    setHerbsImportMessage(null);
    try {
      const count = await importHerbs();
      setHerbsImportMessage(`${count} herbes importées avec succès !`);
      await refreshData();
    } catch (error) {
      console.error('Erreur lors de l\'import des herbes:', error);
      setHerbsImportMessage('Erreur lors de l\'import des herbes');
    } finally {
      setIsImportingHerbs(false);
    }
  };

  // Filtres
  const filteredRaces = races.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSpells = spells.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRace = () => {
    setEditingRace({
      id: '',
      name: '',
      source: 'Homebrew',
      speed: 30,
      size: 'Medium',
      abilityBonuses: [],
      traits: [],
      languages: ['Common'],
    });
    setIsCreatingNew(true);
  };

  const handleCreateClass = () => {
    setEditingClass({
      id: '',
      name: '',
      source: 'Homebrew',
      hitDie: 8,
      primaryAbility: [],
      savingThrows: [],
      skillChoices: { count: 2, from: [] },
      armorProficiencies: [],
      weaponProficiencies: [],
    });
    setIsCreatingNew(true);
  };

  const handleCreateSpell = () => {
    setEditingSpell({
      id: '',
      name: '',
      source: 'Homebrew',
      level: 1,
      school: 'evocation',
      castingTime: '1 action',
      range: '30 feet',
      components: { verbal: true, somatic: true },
      duration: 'Instantaneous',
      description: '',
      classes: [],
    });
    setIsCreatingNew(true);
  };

  const handleCreateItem = () => {
    setEditingItem({
      id: '',
      name: '',
      source: 'Homebrew',
      category: 'adventuring-gear',
      description: '',
    });
    setIsCreatingNew(true);
  };

  const handleEditRace = (race: GameRace) => {
    setEditingRace({ ...race });
    setIsCreatingNew(false);
  };

  const handleEditClass = (cls: GameClass) => {
    setEditingClass({ ...cls });
    setIsCreatingNew(false);
  };

  const handleEditSpell = (spell: GameSpell) => {
    setEditingSpell({ ...spell });
    setIsCreatingNew(false);
  };

  const handleEditItem = (item: GameItem) => {
    setEditingItem({ ...item });
    setIsCreatingNew(false);
  };

  const handleCloseEditor = () => {
    setEditingRace(null);
    setEditingClass(null);
    setEditingSpell(null);
    setEditingItem(null);
    setIsCreatingNew(false);
  };

  const handleSaveComplete = async () => {
    handleCloseEditor();
    await refreshData();
  };

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="homebrew">
      <header className="homebrew-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Retour
        </button>
        <h1>Éditeur de contenu</h1>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'races' ? 'active' : ''}`}
          onClick={() => setActiveTab('races')}
        >
          Races ({races.length})
        </button>
        <button
          className={`tab ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          Classes ({classes.length})
        </button>
        <button
          className={`tab ${activeTab === 'spells' ? 'active' : ''}`}
          onClick={() => setActiveTab('spells')}
        >
          Sorts ({spells.length})
        </button>
        <button
          className={`tab ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Objets ({items.length})
        </button>
      </nav>

      {/* Barre de recherche */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="content">
        {/* Onglet Races */}
        {activeTab === 'races' && (
          <section className="items-section">
            <div className="section-header">
              <h2>Races</h2>
              <button className="create-button" onClick={handleCreateRace}>
                + Nouvelle race
              </button>
            </div>

            {filteredRaces.length === 0 ? (
              <div className="empty-state">
                <p>{searchQuery ? 'Aucun résultat' : 'Aucune race disponible.'}</p>
                <p className="hint">Importez les données SRD ou créez une race homebrew.</p>
              </div>
            ) : (
              <div className="items-grid">
                {filteredRaces.map((race) => (
                  <div
                    key={race.id}
                    className="item-card"
                    onClick={() => handleEditRace(race)}
                  >
                    <div className="item-header">
                      <h3>{race.name}</h3>
                      <span className={`source-badge ${race.source === 'Homebrew' ? 'homebrew' : 'official'}`}>
                        {race.source}
                      </span>
                    </div>
                    <div className="item-details">
                      <span>Vitesse: {race.speed} ft</span>
                      <span>Taille: {race.size}</span>
                      {race.darkvision && <span>Vision: {race.darkvision} ft</span>}
                    </div>
                    <div className="item-bonuses">
                      {race.abilityBonuses.map((ab, i) => (
                        <span key={i} className="bonus-tag">
                          {ab.ability.slice(0, 3).toUpperCase()} +{ab.bonus}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Onglet Classes */}
        {activeTab === 'classes' && (
          <section className="items-section">
            <div className="section-header">
              <h2>Classes</h2>
              <button className="create-button" onClick={handleCreateClass}>
                + Nouvelle classe
              </button>
            </div>

            {filteredClasses.length === 0 ? (
              <div className="empty-state">
                <p>{searchQuery ? 'Aucun résultat' : 'Aucune classe disponible.'}</p>
                <p className="hint">Importez les données SRD ou créez une classe homebrew.</p>
              </div>
            ) : (
              <div className="items-grid">
                {filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="item-card"
                    onClick={() => handleEditClass(cls)}
                  >
                    <div className="item-header">
                      <h3>{cls.name}</h3>
                      <span className={`source-badge ${cls.source === 'Homebrew' ? 'homebrew' : 'official'}`}>
                        {cls.source}
                      </span>
                    </div>
                    <div className="item-details">
                      <span>Dé de vie: d{cls.hitDie}</span>
                      <span>Sauvegardes: {cls.savingThrows.join(', ')}</span>
                    </div>
                    <div className="item-bonuses">
                      {cls.spellcasting && (
                        <span className="bonus-tag spellcaster">
                          Lanceur de sorts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Onglet Sorts */}
        {activeTab === 'spells' && (
          <section className="items-section">
            <div className="section-header">
              <h2>Sorts</h2>
              <button className="create-button" onClick={handleCreateSpell}>
                + Nouveau sort
              </button>
            </div>

            {filteredSpells.length === 0 ? (
              <div className="empty-state">
                <p>{searchQuery ? 'Aucun résultat' : 'Aucun sort disponible.'}</p>
                <p className="hint">Importez les données SRD ou créez un sort homebrew.</p>
              </div>
            ) : (
              <div className="items-grid">
                {filteredSpells.map((spell) => (
                  <div
                    key={spell.id}
                    className="item-card"
                    onClick={() => handleEditSpell(spell)}
                  >
                    <div className="item-header">
                      <h3>{spell.name}</h3>
                      <span className={`source-badge ${spell.source === 'Homebrew' ? 'homebrew' : 'official'}`}>
                        {spell.source}
                      </span>
                    </div>
                    <div className="item-details">
                      <span>{spell.level === 0 ? 'Tour de magie' : `Niveau ${spell.level}`}</span>
                      <span>{SCHOOL_LABELS[spell.school] || spell.school}</span>
                    </div>
                    <div className="item-bonuses">
                      {spell.components.verbal && <span className="bonus-tag">V</span>}
                      {spell.components.somatic && <span className="bonus-tag">S</span>}
                      {spell.components.material && <span className="bonus-tag">M</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Onglet Objets */}
        {activeTab === 'items' && (
          <section className="items-section">
            <div className="section-header">
              <h2>Objets</h2>
              <div className="header-buttons">
                <button
                  className="import-button"
                  onClick={handleImportHerbs}
                  disabled={isImportingHerbs}
                >
                  {isImportingHerbs ? 'Import...' : 'Importer herbes AideDD'}
                </button>
                <button className="create-button" onClick={handleCreateItem}>
                  + Nouvel objet
                </button>
              </div>
            </div>

            {herbsImportMessage && (
              <div className={`import-message ${herbsImportMessage.includes('Erreur') ? 'error' : 'success'}`}>
                {herbsImportMessage}
              </div>
            )}

            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <p>{searchQuery ? 'Aucun résultat' : 'Aucun objet disponible.'}</p>
                <p className="hint">Importez les données SRD ou créez un objet homebrew.</p>
              </div>
            ) : (
              <div className="items-grid">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="item-card"
                    onClick={() => handleEditItem(item)}
                  >
                    <div className="item-header">
                      <h3>{item.name}</h3>
                      <span className={`source-badge ${item.source === 'Homebrew' ? 'homebrew' : 'official'}`}>
                        {item.source}
                      </span>
                    </div>
                    <div className="item-details">
                      <span>{CATEGORY_LABELS[item.category] || item.category}</span>
                      {item.cost && <span>{item.cost.quantity} {item.cost.unit}</span>}
                      {item.weight && <span>{item.weight} lb</span>}
                    </div>
                    <div className="item-bonuses">
                      {item.rarity && (
                        <span className="bonus-tag magic">{item.rarity}</span>
                      )}
                      {item.damage && (
                        <span className="bonus-tag">{item.damage.dice} {item.damage.type}</span>
                      )}
                      {item.armorClass && (
                        <span className="bonus-tag">CA {item.armorClass.base}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Éditeur de race */}
      {editingRace && (
        <RaceEditor
          race={editingRace}
          isNew={isCreatingNew}
          onSave={handleSaveComplete}
          onCancel={handleCloseEditor}
        />
      )}

      {/* Éditeur de classe */}
      {editingClass && (
        <ClassEditor
          gameClass={editingClass}
          isNew={isCreatingNew}
          onSave={handleSaveComplete}
          onCancel={handleCloseEditor}
        />
      )}

      {/* Éditeur de sort */}
      {editingSpell && (
        <SpellEditor
          spell={editingSpell}
          isNew={isCreatingNew}
          onSave={handleSaveComplete}
          onCancel={handleCloseEditor}
        />
      )}

      {/* Éditeur d'objet */}
      {editingItem && (
        <ItemEditor
          item={editingItem}
          isNew={isCreatingNew}
          onSave={handleSaveComplete}
          onCancel={handleCloseEditor}
        />
      )}
    </div>
  );
}
