import { useEffect } from 'react';
import { useTranscription } from '@/hooks/useTranscription';

interface TranscribeInputProps {
  onTranscriptionReceived: (transcription: string) => void;
  disabled: boolean;
}

export function TranscribeInput({ onTranscriptionReceived, disabled }: TranscribeInputProps) {
  const {
    isRecording,
    isProcessing,
    error,
    transcription,
    startRecording,
    stopRecording,
    clearResults,
  } = useTranscription();

  // Cuando se recibe una transcripción, pasarla al padre
  useEffect(() => {
    if (transcription) {
      onTranscriptionReceived(transcription);
      // Limpiar después de un tiempo
      setTimeout(() => {
        clearResults();
      }, 1000);
    }
  }, [transcription, onTranscriptionReceived, clearResults]);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <label style={styles.label}>Transcripción Rápida</label>
        <span style={styles.badge}>⚡ Más rápido</span>
      </div>

      {/* Botón de Micrófono */}
      <button
        onClick={handleToggleRecording}
        disabled={disabled || isProcessing}
        style={{
          ...styles.micButton,
          ...(isRecording ? styles.micButtonRecording : {}),
          ...(disabled || isProcessing ? styles.micButtonDisabled : {}),
        }}
      >
        {isProcessing ? (
          <>
            <span className="spinner" style={styles.spinner}></span>
            <span>Transcribiendo...</span>
          </>
        ) : isRecording ? (
          <>
            <span style={styles.micIcon}>🔴</span>
            <span>Detener</span>
          </>
        ) : (
          <>
            <span style={styles.micIcon}>🎤</span>
            <span>Presiona y Habla</span>
          </>
        )}
      </button>

      {/* Indicador de grabación */}
      {isRecording && (
        <div style={styles.recordingIndicator}>
          <div style={styles.recordingPulse}></div>
          <span style={styles.recordingText}>Grabando...</span>
        </div>
      )}

      {/* Mostrar transcripción */}
      {transcription && !isProcessing && (
        <div style={styles.resultBox}>
          <div style={styles.resultLabel}>✅ Transcrito</div>
          <div style={styles.resultText}>{transcription}</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <span style={styles.errorText}>{error}</span>
        </div>
      )}

      {/* Instrucciones */}
      <div style={styles.instructions}>
        <p style={styles.instructionText}>
          Solo transcribe lo que dices, sin procesamiento IA.
          Ideal para repetir mensajes exactos. 
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  badge: {
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    color: '#4ade80',
    borderRadius: '4px',
    border: '1px solid rgba(74, 222, 128, 0.3)',
  },
  micButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: '8px',
    border: '2px solid rgba(74, 222, 128, 0.3)',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  micButtonRecording: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  micButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  micIcon: {
    fontSize: '20px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    borderWidth: '2px',
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '6px',
  },
  recordingPulse: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    animation: 'pulse 1s ease-in-out infinite',
  },
  recordingText: {
    fontSize: '13px',
    color: '#ef4444',
    fontWeight: 600,
  },
  resultBox: {
    padding: '12px',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    border: '1px solid rgba(74, 222, 128, 0.2)',
    borderRadius: '6px',
  },
  resultLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '6px',
  },
  resultText: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.4',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
  },
  errorIcon: {
    fontSize: '16px',
  },
  errorText: {
    fontSize: '13px',
    color: '#fca5a5',
  },
  instructions: {
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  instructionText: {
    margin: 0,
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: '1.5',
  },
};
