import { useEffect, useRef } from 'react';
import { useTranscription } from '@/hooks/useTranscription';
import { useRealtimeAI } from '@/hooks/useRealtimeAI';
import type { MicrophoneMode } from './SettingsModal';
import { styles } from './styles/UnifiedVoiceInput.styles';

interface UnifiedVoiceInputProps {
  onTextReceived: (text: string) => void;
  onAutoSend?: (text: string) => void; // Función para envío automático
  disabled: boolean;
  mode: MicrophoneMode;
  systemPrompt?: string;
  autoSendEnabled?: boolean; // Si está habilitado el envío automático
}

export function UnifiedVoiceInput({
  onTextReceived,
  onAutoSend,
  disabled,
  mode,
  systemPrompt,
  autoSendEnabled = false
}: UnifiedVoiceInputProps) {
  // Hook para transcripción rápida
  const transcription = useTranscription();

  // Hook para voz + IA (Realtime API)
  const realtimeAI = useRealtimeAI();

  // Ref para evitar procesar el mismo texto dos veces
  const lastProcessedTextRef = useRef<string | null>(null);

  // Actualizar system prompt cuando cambie (solo para modo IA)
  useEffect(() => {
    if (mode === 'ai-response' && systemPrompt) {
      realtimeAI.setSystemPrompt(systemPrompt);
    }
  }, [mode, systemPrompt, realtimeAI.setSystemPrompt]);

  // Determinar qué hook usar según el modo
  const activeHook = mode === 'transcribe' ? transcription : realtimeAI;

  const isRecording = activeHook.isRecording;
  const isProcessing = activeHook.isProcessing;
  const error = activeHook.error;

  // Obtener el texto resultante según el modo
  const resultText = mode === 'transcribe'
    ? transcription.transcription
    : realtimeAI.response;

  // Cuando se recibe texto, decidir si enviar automáticamente o pasar al textarea
  useEffect(() => {
    if (resultText && resultText !== lastProcessedTextRef.current) {
      // Marcar este texto como procesado ANTES de enviarlo
      lastProcessedTextRef.current = resultText;

      // Si está en modo IA con envío automático, enviar directamente
      if (mode === 'ai-response' && autoSendEnabled && onAutoSend) {
        onAutoSend(resultText);
      } else {
        // Sino, pasar al textarea para revisión
        onTextReceived(resultText);
      }

      // Limpiar después de un tiempo
      setTimeout(() => {
        activeHook.clearResults();
        // Reset del ref cuando se limpia el resultado
        lastProcessedTextRef.current = null;
      }, 1000);
    }
  }, [resultText, onTextReceived, onAutoSend, mode, autoSendEnabled]);

  const handleToggleRecording = () => {
    if (isRecording) {
      activeHook.stopRecording();
    } else {
      activeHook.startRecording();
    }
  };

  // Determinar label según el modo
  const modeLabel = mode === 'transcribe' ? '⚡ Transcripción Rápida' : '🚀 IA en Tiempo Real';
  const processingLabel = mode === 'transcribe' ? 'Transcribiendo...' : 'Procesando...';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <label style={styles.label}>Entrada por Voz</label>
        <span style={styles.modeIndicator}>{modeLabel}</span>
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
            <span>{processingLabel}</span>
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

      {/* Mostrar resultado */}
      {resultText && !isProcessing && (
        <div style={styles.resultBox}>
          <div style={styles.resultLabel}>
            {mode === 'transcribe' ? '📝 Transcrito:' : '🤖 Respuesta generada:'}
          </div>
          <div style={styles.resultText}>{resultText}</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <span style={styles.errorText}>{error}</span>
        </div>
      )}


    </div>
  );
}
