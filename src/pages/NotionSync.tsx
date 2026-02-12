import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotionStatus,
  setupDatabases,
  configureDatabases,
  connectNotion,
  disconnectNotion,
  type NotionStatus,
} from '../services/notion/notionApi';
import {
  syncAllFromNotion,
  pushAllCharactersToNotion,
} from '../services/notion/notionSync';
import { getAllCharacters } from '../services/storage/characterService';
import type { Character } from '../types';
import './NotionSync.css';

type SyncState = 'idle' | 'syncing' | 'success' | 'error';

export function NotionSync() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<NotionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [dbIds, setDbIds] = useState({
    characters: '',
    races: '',
    classes: '',
    spells: '',
    items: '',
  });

  // Login form state
  const [apiKey, setApiKey] = useState('');
  const [pageId, setPageId] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState('');

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      const s = await getNotionStatus();
      setStatus(s);
      if (s.databases) {
        setDbIds({
          characters: s.databases.characters || '',
          races: s.databases.races || '',
          classes: s.databases.classes || '',
          spells: s.databases.spells || '',
          items: s.databases.items || '',
        });
      }
      // Pre-fill login form with env var hints
      if (s.envHints) {
        if (s.envHints.apiKey) setApiKey(s.envHints.apiKey);
        if (s.envHints.pageId) setPageId(s.envHints.pageId);
      }
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    getAllCharacters().then(setCharacters);
  }, [refreshStatus]);

  const handleConnect = async () => {
    if (!apiKey.trim() || !pageId.trim()) {
      setConnectError('Veuillez remplir les deux champs');
      return;
    }

    setConnectLoading(true);
    setConnectError('');
    try {
      await connectNotion(apiKey.trim(), pageId.trim());
      setApiKey('');
      setPageId('');
      await refreshStatus();
    } catch (error) {
      setConnectError(error instanceof Error ? error.message : 'Connexion impossible');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectNotion();
    setStatus(null);
    await refreshStatus();
  };

  const handleSetup = async () => {
    setSyncState('syncing');
    setSyncMessage('Cr\u00e9ation des bases Notion...');
    try {
      const result = await setupDatabases();
      setDbIds({
        characters: result.databases.characters || '',
        races: result.databases.races || '',
        classes: result.databases.classes || '',
        spells: result.databases.spells || '',
        items: result.databases.items || '',
      });
      setSyncState('success');
      setSyncMessage('Bases de donn\u00e9es cr\u00e9\u00e9es avec succ\u00e8s !');
      await refreshStatus();
    } catch (error) {
      setSyncState('error');
      setSyncMessage(error instanceof Error ? error.message : 'Erreur lors de la cr\u00e9ation');
    }
  };

  const handleConfigure = async () => {
    setSyncState('syncing');
    setSyncMessage('Configuration des bases...');
    try {
      const result = await configureDatabases(dbIds);
      const invalid = Object.entries(result.validations).filter(([, v]) => !v);
      if (invalid.length > 0) {
        setSyncState('error');
        setSyncMessage(`Bases invalides: ${invalid.map(([k]) => k).join(', ')}`);
      } else {
        setSyncState('success');
        setSyncMessage('Configuration enregistr\u00e9e !');
        await refreshStatus();
      }
    } catch (error) {
      setSyncState('error');
      setSyncMessage(error instanceof Error ? error.message : 'Erreur de configuration');
    }
  };

  const handleSyncFromNotion = async () => {
    setSyncState('syncing');
    try {
      const results = await syncAllFromNotion((msg, progress) => {
        setSyncMessage(msg);
        setSyncProgress(progress);
      });
      setSyncState('success');
      setSyncMessage(
        `Sync terminée : ${results.races} races, ${results.classes} classes, ${results.spells} sorts, ${results.items} objets`
      );
    } catch (error) {
      setSyncState('error');
      setSyncMessage(error instanceof Error ? error.message : 'Erreur de synchronisation');
    }
  };

  const handlePushCharacters = async () => {
    setSyncState('syncing');
    try {
      const count = await pushAllCharactersToNotion(characters, (msg, progress) => {
        setSyncMessage(msg);
        setSyncProgress(progress);
      });
      setSyncState('success');
      setSyncMessage(`${count} personnage(s) envoyé(s) vers Notion`);
    } catch (error) {
      setSyncState('error');
      setSyncMessage(error instanceof Error ? error.message : 'Erreur de synchronisation');
    }
  };

  if (loading) {
    return <div className="loading">Vérification de la connexion Notion...</div>;
  }

  const isConnected = status?.connected;

  return (
    <div className="notion-sync">
      <header className="notion-header">
        <button className="back-button" onClick={() => navigate('/')}>
          &larr; Retour
        </button>
        <h1>Notion Back-Office</h1>
        <p className="subtitle">Gérez vos données D&D depuis Notion</p>
      </header>

      {!isConnected ? (
        /* ===== LOGIN FORM ===== */
        <section className="section">
          <div className="login-card">
            <div className="login-icon">N</div>
            <h2 className="login-title">Connexion à Notion</h2>
            <p className="login-description">
              Entrez votre clé API d'intégration et l'ID de la page parente pour connecter votre workspace Notion.
            </p>

            <div className="login-form">
              <div className="login-field">
                <label htmlFor="api-key">Clé API Notion</label>
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ntn_xxxxxxxxxxxxx..."
                  disabled={connectLoading}
                />
                <span className="field-hint">
                  Depuis <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">notion.so/my-integrations</a>
                </span>
              </div>

              <div className="login-field">
                <label htmlFor="page-id">ID de la page parente</label>
                <input
                  id="page-id"
                  type="text"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  disabled={connectLoading}
                />
                <span className="field-hint">
                  L'ID se trouve dans l'URL de votre page Notion
                </span>
              </div>

              {connectError && (
                <div className="login-error">{connectError}</div>
              )}

              <button
                className="action-button primary login-button"
                onClick={handleConnect}
                disabled={connectLoading || !apiKey.trim() || !pageId.trim()}
              >
                {connectLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* ===== CONNECTED STATE ===== */}
          <section className="section">
            <h2>Connexion</h2>
            <div className="status-card connected">
              <div className="status-indicator" />
              <div className="status-info">
                <p className="status-text">
                  Connecté en tant que {status.user}
                </p>
              </div>
              <button className="disconnect-button" onClick={handleDisconnect}>
                Déconnexion
              </button>
            </div>
          </section>

          {/* Database Setup */}
          <section className="section">
            <h2>Bases de données Notion</h2>

            {!status.configured ? (
              <div className="setup-section">
                <p className="info-text">
                  Les bases de données Notion n'ont pas encore été créées. Vous pouvez les créer
                  automatiquement ou entrer les IDs de bases existantes.
                </p>

                <button
                  className="action-button primary"
                  onClick={handleSetup}
                  disabled={syncState === 'syncing'}
                >
                  Créer les bases de données
                </button>

                <div className="divider">ou configurer manuellement</div>

                <div className="db-config">
                  {Object.entries(dbIds).map(([key, value]) => (
                    <div key={key} className="config-row">
                      <label>{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setDbIds(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder="ID de la base Notion..."
                      />
                    </div>
                  ))}
                  <button
                    className="action-button"
                    onClick={handleConfigure}
                    disabled={syncState === 'syncing'}
                  >
                    Enregistrer la configuration
                  </button>
                </div>
              </div>
            ) : (
              <div className="db-status">
                {Object.entries(status.databases).map(([key, id]) => (
                  <div key={key} className="db-row">
                    <span className="db-name">{key}</span>
                    <span className="db-id">{id ? id.slice(0, 8) + '...' : 'Non configuré'}</span>
                    <span className={`db-check ${id ? 'ok' : 'missing'}`}>
                      {id ? 'OK' : '!'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sync Actions */}
          {status.configured && (
            <section className="section">
              <h2>Synchronisation</h2>

              <div className="sync-actions">
                <div className="sync-card" onClick={handleSyncFromNotion}>
                  <div className="sync-icon">&#x21E9;</div>
                  <div>
                    <h3>Importer depuis Notion</h3>
                    <p>Récupère races, classes, sorts et objets depuis vos bases Notion</p>
                  </div>
                </div>

                <div className="sync-card" onClick={handlePushCharacters}>
                  <div className="sync-icon">&#x21E7;</div>
                  <div>
                    <h3>Exporter les personnages</h3>
                    <p>Envoie vos {characters.length} personnage(s) vers Notion pour backup</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              {syncState !== 'idle' && (
                <div className={`sync-feedback ${syncState}`}>
                  {syncState === 'syncing' && (
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${syncProgress}%` }} />
                    </div>
                  )}
                  <p className="sync-message">{syncMessage}</p>
                </div>
              )}
            </section>
          )}

          {/* How it works */}
          <section className="section">
            <h2>Comment ça marche</h2>
            <div className="info-card">
              <ol className="how-it-works">
                <li>Vos données de jeu (races, classes, sorts, objets) vivent dans Notion</li>
                <li>Vous les éditez directement dans l'interface Notion</li>
                <li>Cliquez "Importer depuis Notion" pour synchroniser dans l'app</li>
                <li>Les personnages sont stockés localement et peuvent être sauvegardés sur Notion</li>
              </ol>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
