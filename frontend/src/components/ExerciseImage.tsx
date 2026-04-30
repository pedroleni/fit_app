import { useExerciseImage } from '../hooks/useExerciseImage';
import './ExerciseImage.css';

interface Props {
  nombre: string;
  grupoMuscular: string;
  fallbackSrc: string;
  alt?: string;
  className?: string;
}

/**
 * Renders an exercise image that:
 * 1. Shows the `fallbackSrc` immediately (local file or picsum)
 * 2. Lazily requests an AI-generated image from the backend
 * 3. Fades in the AI image when it arrives
 * 4. Shows a subtle shimmer over the fallback while loading
 */
export function ExerciseImage({ nombre, grupoMuscular, fallbackSrc, alt, className = '' }: Props) {
  const { src, isLoading } = useExerciseImage(nombre, grupoMuscular, fallbackSrc);

  return (
    <div className={`ex-img-wrap ${className}`}>
      <img src={src} alt={alt ?? nombre} className="ex-img" loading="lazy" />
      {isLoading && <div className="ex-img-shimmer" />}
    </div>
  );
}
