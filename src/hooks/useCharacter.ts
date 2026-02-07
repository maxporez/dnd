import { useState, useEffect, useCallback } from 'react';
import type { Character, ComputedCharacter } from '../types';
import {
  getCharacter,
  updateCharacter,
  createCharacter,
  deleteCharacter,
} from '../services/storage';
import { computeCharacterStats } from '../services/calculator';

interface UseCharacterResult {
  character: ComputedCharacter | null;
  loading: boolean;
  error: string | null;
  saveCharacter: (updates: Partial<Character>) => Promise<void>;
  refreshCharacter: () => Promise<void>;
}

export function useCharacter(characterId: string | null): UseCharacterResult {
  const [character, setCharacter] = useState<ComputedCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCharacter = useCallback(async () => {
    if (!characterId) {
      setCharacter(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCharacter(characterId);

      if (data) {
        const computed = computeCharacterStats(data);
        setCharacter(computed);
      } else {
        setError('Personnage non trouvé');
        setCharacter(null);
      }
    } catch (err) {
      setError('Erreur lors du chargement du personnage');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  const saveCharacter = useCallback(
    async (updates: Partial<Character>) => {
      if (!characterId || !character) return;

      try {
        const updated = await updateCharacter(characterId, updates);
        if (updated) {
          const computed = computeCharacterStats(updated);
          setCharacter(computed);
        }
      } catch (err) {
        setError('Erreur lors de la sauvegarde');
        console.error(err);
      }
    },
    [characterId, character]
  );

  const refreshCharacter = useCallback(async () => {
    await loadCharacter();
  }, [loadCharacter]);

  return {
    character,
    loading,
    error,
    saveCharacter,
    refreshCharacter,
  };
}

// Hook pour la liste des personnages
import { getAllCharacters } from '../services/storage';

interface UseCharactersResult {
  characters: Character[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data?: Partial<Character>) => Promise<Character>;
  remove: (id: string) => Promise<void>;
}

export function useCharacters(): UseCharactersResult {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCharacters();
      setCharacters(data);
    } catch (err) {
      setError('Erreur lors du chargement des personnages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const create = useCallback(async (data?: Partial<Character>) => {
    const newCharacter = await createCharacter(data || {});
    setCharacters((prev) => [newCharacter, ...prev]);
    return newCharacter;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteCharacter(id);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    characters,
    loading,
    error,
    refresh: loadCharacters,
    create,
    remove,
  };
}
