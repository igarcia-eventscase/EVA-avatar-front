import { useEffect, useRef } from 'react';
import { styles, statusDot } from './styles/AvatarViewer.styles';

type AspectRatio = '16:9' | '9:16' | '4:3' | '1:1' | '4:5';

interface AvatarViewerProps {
  mediaStream: MediaStream | null;
  isConnected: boolean;
  isSpeaking: boolean;
  aspectRatio?: AspectRatio;  // Formato del video
}

export function AvatarViewer({
  mediaStream,
  isConnected,
  isSpeaking,
  aspectRatio = '16:9'  // Por defecto horizontal
}: AvatarViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Calcular padding-top para el aspect ratio
  const getAspectRatioPadding = (ratio: AspectRatio): string => {
    const ratios: Record<AspectRatio, number> = {
      '16:9': (9 / 16) * 100,   // Horizontal estándar
      '9:16': (16 / 9) * 100,   // Vertical (stories/reels)
      '4:3': (3 / 4) * 100,     // Clásico
      '1:1': 100,                // Cuadrado
      '4:5': (5 / 4) * 100,     // Vertical corto
    };
    return `${ratios[ratio]}%`;
  };

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.videoWrapper,
          paddingTop: getAspectRatioPadding(aspectRatio),
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={styles.video}
        />

        {!isConnected && (
          <div style={styles.overlay}>
            <div style={styles.placeholder}>
              <div style={styles.avatarIcon}>👤</div>
              <p style={styles.placeholderText}>
                {mediaStream ? 'Conectando...' : 'Avatar no conectado'}
              </p>
            </div>
          </div>
        )}

        {isConnected && isSpeaking && (
          <div style={styles.speakingIndicator}>
            <div style={styles.pulse}></div>
            <span style={styles.speakingText}>Hablando...</span>
          </div>
        )}
      </div>

      <div style={styles.statusBar}>
        <div style={styles.statusItem}>
          <span style={statusDot(isConnected)}></span>
          <span style={styles.statusLabel}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>
    </div>
  );
}
