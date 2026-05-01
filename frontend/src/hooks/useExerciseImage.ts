import { useState, useEffect, useRef } from 'react';
import { generateExerciseImage } from '../services/api';

// In-memory request dedup: maps "nombre::grupoMuscular" → pending Promise
const pending = new Map<string, Promise<{ imageBase64: string; mimeType: string } | null>>();

// In-memory image cache so the same exercise on the page doesn't retrigger
const imageCache = new Map<string, string>(); // key → data URI

interface UseExerciseImageResult {
  /** data URI src ready to use directly in <img> */
  src: string;
  /** true while waiting for the server */
  isLoading: boolean;
  /** true if generation failed (fallback will stay) */
  error: boolean;
}

/**
 * Lazily fetches an AI-generated image for the given exercise.
 * Shows `fallbackSrc` immediately; replaces with generated image when ready.
 * Deduplicates in-flight requests and caches resolved images in memory.
 */
export function useExerciseImage(
  nombre: string,
  grupoMuscular: string,
  fallbackSrc: string,
  /** Set to false to skip generation (e.g. when already have a good local image) */
  enabled = true
): UseExerciseImageResult {
  const key = `${nombre}::${grupoMuscular}`;
  const [src, setSrc] = useState<string>(() => imageCache.get(key) ?? fallbackSrc);
  const [isLoading, setIsLoading] = useState<boolean>(() => !imageCache.has(key) && enabled);
  const [error, setError] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!enabled || !nombre) return;

    // Already have it in memory cache
    if (imageCache.has(key)) {
      setSrc(imageCache.get(key)!);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(false);

    // Dedup concurrent requests for the same exercise
    let request = pending.get(key);
    if (!request) {
      request = generateExerciseImage(nombre, grupoMuscular)
        .then((res) => res.data)
        .catch(() => null)
        .finally(() => pending.delete(key));
      pending.set(key, request);
    }

    request.then((data) => {
      if (!mounted.current) return;
      if (data?.imageBase64) {
        const dataUri = `data:${data.mimeType ?? 'image/png'};base64,${data.imageBase64}`;
        imageCache.set(key, dataUri);
        setSrc(dataUri);
        setError(false);
      } else {
        setError(true);
      }
      setIsLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return { src, isLoading, error };
}
