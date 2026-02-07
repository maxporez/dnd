import { useState, useEffect, useCallback } from 'react';
import {
  getLocalRaces,
  getLocalClasses,
  getLocalSpells,
  getLocalItems,
  importAllData,
} from '../services/data';
import { isDataImported, getDataStatus } from '../services/storage';
import type { GameRace, GameClass, GameSpell, GameItem, DataImportStatus } from '../services/storage/database';

interface UseGameDataResult {
  // État
  isLoading: boolean;
  isImporting: boolean;
  importProgress: number;
  importMessage: string;
  error: string | null;
  dataStatus: DataImportStatus | null;
  hasData: boolean;

  // Données
  races: GameRace[];
  classes: GameClass[];
  spells: GameSpell[];
  items: GameItem[];

  // Actions
  startImport: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useGameData(): UseGameDataResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<DataImportStatus | null>(null);
  const [hasData, setHasData] = useState(false);

  const [races, setRaces] = useState<GameRace[]>([]);
  const [classes, setClasses] = useState<GameClass[]>([]);
  const [spells, setSpells] = useState<GameSpell[]>([]);
  const [items, setItems] = useState<GameItem[]>([]);

  // Charger les données locales
  const loadLocalData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const imported = await isDataImported();
      setHasData(imported);

      if (imported) {
        const status = await getDataStatus();
        setDataStatus(status || null);

        const [racesData, classesData, spellsData, itemsData] = await Promise.all([
          getLocalRaces(),
          getLocalClasses(),
          getLocalSpells(),
          getLocalItems(),
        ]);

        setRaces(racesData);
        setClasses(classesData);
        setSpells(spellsData);
        setItems(itemsData);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lancer l'import
  const startImport = useCallback(async () => {
    try {
      setIsImporting(true);
      setError(null);
      setImportProgress(0);
      setImportMessage('Démarrage de l\'import...');

      const status = await importAllData((message, progress) => {
        setImportMessage(message);
        setImportProgress(progress);
      });

      setDataStatus(status);
      setHasData(true);

      // Recharger les données
      await loadLocalData();
    } catch (err) {
      setError('Erreur lors de l\'import des données');
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  }, [loadLocalData]);

  // Rafraîchir les données
  const refreshData = useCallback(async () => {
    await loadLocalData();
  }, [loadLocalData]);

  // Charger au montage
  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

  return {
    isLoading,
    isImporting,
    importProgress,
    importMessage,
    error,
    dataStatus,
    hasData,
    races,
    classes,
    spells,
    items,
    startImport,
    refreshData,
  };
}

// Hook simplifié pour juste les races
export function useRaces(): { races: GameRace[]; loading: boolean } {
  const [races, setRaces] = useState<GameRace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocalRaces()
      .then(setRaces)
      .finally(() => setLoading(false));
  }, []);

  return { races, loading };
}

// Hook simplifié pour juste les classes
export function useClasses(): { classes: GameClass[]; loading: boolean } {
  const [classes, setClasses] = useState<GameClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocalClasses()
      .then(setClasses)
      .finally(() => setLoading(false));
  }, []);

  return { classes, loading };
}
