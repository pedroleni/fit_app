import { useEffect } from 'react';
import './VideoModal.css';

interface VideoModalProps {
  query: string;
  videoId?: string | null;
  onClose: () => void;
}

export function VideoModal({ query, videoId, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const embedId = videoId || '';

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal__header">
          <h3 className="video-modal__title">🎬 {query}</h3>
          <button className="video-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="video-modal__body">
          {embedId ? (
            <iframe
              className="video-modal__iframe"
              src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`}
              title={query}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="video-modal__search">
              <p>No se encontró un video específico. Busca en YouTube:</p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="video-modal__search-link"
              >
                🔍 Buscar "{query}" en YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
