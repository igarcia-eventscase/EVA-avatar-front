import { CSSProperties } from 'react';

export const statusDot = (isActive: boolean): CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: isActive ? '#4ade80' : '#ef4444',
});

export const styles: Record<string, CSSProperties> = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: 0, // Altura controlada por paddingTop
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Recorta el video para llenar el contenedor
    objectPosition: 'top center', // Alinea desde arriba - la cabeza siempre visible
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  placeholder: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  avatarIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    opacity: 0.3,
  },
  placeholderText: {
    fontSize: '16px',
    margin: 0,
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(100, 108, 255, 0.9)',
    padding: '10px 20px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pulse: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  speakingText: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 500,
  },
  statusBar: {
    padding: '12px 20px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusLabel: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
};
