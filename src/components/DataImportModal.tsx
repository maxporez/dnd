import { useGameData } from '../hooks/useGameData';
import './DataImportModal.css';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataImportModal({ isOpen, onClose }: DataImportModalProps) {
  const {
    isImporting,
    importProgress,
    importMessage,
    error,
    dataStatus,
    hasData,
    startImport,
  } = useGameData();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Import des données D&D</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="modal-body">
          {hasData && dataStatus ? (
            <div className="data-status">
              <h3>Données actuelles</h3>
              <ul>
                <li>Races: {dataStatus.racesCount}</li>
                <li>Classes: {dataStatus.classesCount}</li>
                <li>Sorts: {dataStatus.spellsCount}</li>
                <li>Objets: {dataStatus.itemsCount}</li>
              </ul>
              <p className="last-import">
                Dernière mise à jour: {new Date(dataStatus.lastImport).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ) : (
            <div className="no-data">
              <p>Aucune donnée importée.</p>
              <p className="hint">
                Importez les données du SRD (System Reference Document) pour avoir accès aux races,
                classes, sorts et équipements officiels.
              </p>
            </div>
          )}

          {isImporting && (
            <div className="import-progress">
              <p className="progress-message">{importMessage}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${importProgress}%` }} />
              </div>
              <p className="progress-percent">{Math.round(importProgress)}%</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <footer className="modal-footer">
          <button className="secondary-button" onClick={onClose} disabled={isImporting}>
            Fermer
          </button>
          <button
            className="primary-button"
            onClick={startImport}
            disabled={isImporting}
          >
            {isImporting ? 'Import en cours...' : hasData ? 'Réimporter les données' : 'Importer les données SRD'}
          </button>
        </footer>
      </div>
    </div>
  );
}
