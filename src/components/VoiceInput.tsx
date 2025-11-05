import { useEffect } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface VoiceInputProps {
  onResponseReceived: (response: string) => void;
  disabled: boolean;
}

export function VoiceInput({ onResponseReceived, disabled }: VoiceInputProps) {
  const {
    isRecording,
    isProcessing,
    error,
    transcription,
    response,
    startRecording,
    stopRecording,
    clearResults,
  } = useVoiceInput();

  // Cuando se recibe una respuesta, pasarla al padre
  useEffect(() => {
    if (response) {
      onResponseReceived(response);
      // Limpiar después de un tiempo
      setTimeout(() => {
        clearResults();
      }, 1000);
    }
  }, [response, onResponseReceived, clearResults]);

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
        <label style={styles.label}>Entrada por Voz</label>
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
            <span>Procesando...</span>
          </>
        ) : isRecording ? (
          <>
            <span style={styles.micIcon}>🔴</span>
            <span>Detener Grabación</span>
          </>
        ) : (
          <>
            <span style={styles.micIcon}>🎤</span>
            <span>Presiona para Hablar</span>
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
          <div style={styles.resultLabel}>📝 Escuchado:</div>
          <div style={styles.resultText}>{transcription}</div>
        </div>
      )}

      {/* Mostrar respuesta generada */}
      {response && !isProcessing && (
        <div style={{...styles.resultBox, ...styles.responseBox}}>
          <div style={styles.resultLabel}>🤖 Respuesta:</div>
          <div style={styles.resultText}>{response}</div>
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
          1. Presiona el botón y habla<br />
          2. Presiona de nuevo para detener<br />
          3. La respuesta aparecerá automáticamente
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
  micButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: '8px',
    border: '2px solid rgba(100, 108, 255, 0.3)',
    backgroundColor: 'rgba(100, 108, 255, 0.1)',
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
    backgroundColor: 'rgba(100, 108, 255, 0.05)',
    border: '1px solid rgba(100, 108, 255, 0.2)',
    borderRadius: '6px',
  },
  responseBox: {
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    borderColor: 'rgba(74, 222, 128, 0.2)',
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
