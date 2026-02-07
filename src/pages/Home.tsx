import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacter';
import { DataImportModal } from '../components/DataImportModal';
import { isDataImported } from '../services/storage';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const { characters, loading, error, create, remove } = useCharacters();
  const [showImportModal, setShowImportModal] = useState(false);
  const [hasData, setHasData] = useState<boolean | null>(null);

  // Vérifier si les données sont importées
  useEffect(() => {
    isDataImported().then(setHasData);
  }, [showImportModal]);

  const handleCreateCharacter = async () => {
    const newChar = await create({ name: 'Nouveau personnage' });
    navigate(`/character/${newChar.id}`);
  };

  const handleDeleteCharacter = async (id: string, name: string) => {
    if (confirm(`Supprimer "${name}" ?`)) {
      await remove(id);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="home">
      <header className="home-header">
        <h1>D&D Character Sheet</h1>
        <p className="subtitle">Gestionnaire de fiches 5.5</p>
      </header>

      {/* Alerte si pas de données */}
      {hasData === false && (
        <div className="data-alert" onClick={() => setShowImportModal(true)}>
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">
            Données SRD non importées. Cliquez ici pour importer les races, classes et sorts.
          </span>
        </div>
      )}

      <div className="actions">
        <button className="create-button" onClick={handleCreateCharacter}>
          + Nouveau personnage
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="characters-list">
        <h2>Mes personnages</h2>

        {characters.length === 0 ? (
          <div className="empty-state">
            <p>Aucun personnage</p>
            <p className="hint">Créez votre premier personnage pour commencer !</p>
          </div>
        ) : (
          <div className="character-cards">
            {characters.map((char) => {
              const totalLevel = char.classes.reduce((sum, c) => sum + c.level, 0) || 1;
              const classString = char.classes.map((c) => c.className).join('/') || 'Classe non définie';

              return (
                <div
                  key={char.id}
                  className="character-card"
                  onClick={() => navigate(`/character/${char.id}`)}
                >
                  <div className="card-content">
                    <h3 className="card-name">{char.name || 'Sans nom'}</h3>
                    <p className="card-info">
                      {char.race.raceName || 'Race ?'} • {classString} • Niv. {totalLevel}
                    </p>
                  </div>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCharacter(char.id, char.name);
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="home-footer">
        <nav className="nav-links">
          <button onClick={() => setShowImportModal(true)}>
            {hasData ? 'Données SRD' : 'Importer données'}
          </button>
          <button onClick={() => navigate('/homebrew')}>Règles maison</button>
        </nav>
      </footer>

      {/* Modal d'import */}
      <DataImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  );
}
