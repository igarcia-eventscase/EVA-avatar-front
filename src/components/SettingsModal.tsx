import { useState, useEffect } from 'react';
import { DEFAULT_SYSTEM_PROMPT } from '@/hooks/useSettings';
import { styles } from './styles/SettingsModal.styles';

export type MicrophoneMode = 'transcribe' | 'ai-response';
export type AspectRatio = '16:9' | '9:16' | '4:3' | '1:1' | '4:5';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  microphoneMode: MicrophoneMode;
  onMicrophoneModeChange: (mode: MicrophoneMode) => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  autoSendAiResponse: boolean;
  onAutoSendAiResponseChange: (value: boolean) => void;
  avatarId: string;
  onAvatarIdChange: (avatarId: string) => void;
  voiceId: string;
  onVoiceIdChange: (voiceId: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  microphoneMode,
  onMicrophoneModeChange,
  systemPrompt,
  onSystemPromptChange,
  aspectRatio,
  onAspectRatioChange,
  autoSendAiResponse,
  onAutoSendAiResponseChange,
  avatarId,
  onAvatarIdChange,
  voiceId,
  onVoiceIdChange,
}: SettingsModalProps) {
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);

  // Sincronizar cuando cambia el prop externo
  useEffect(() => {
    setLocalPrompt(systemPrompt);
  }, [systemPrompt]);

  const handleSave = () => {
    onSystemPromptChange(localPrompt);
    onClose();
  };

  const handleReset = () => {
    setLocalPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>⚙️ Configuración</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Modo de Micrófono */}
          <section style={styles.section}>
            <label style={styles.sectionLabel}>Modo de Micrófono</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioOption}>
                <input
                  type="radio"
                  name="micMode"
                  value="transcribe"
                  checked={microphoneMode === 'transcribe'}
                  onChange={() => onMicrophoneModeChange('transcribe')}
                  style={styles.radio}
                />
                <div style={styles.radioContent}>
                  <div style={styles.radioTitle}>
                    ⚡ Solo Transcribir
                    <span style={styles.badge}>Rápido</span>
                  </div>
                  <div style={styles.radioDescription}>
                    Convierte voz a texto directamente. Latencia: ~1-2 segundos
                  </div>
                </div>
              </label>

              <label style={styles.radioOption}>
                <input
                  type="radio"
                  name="micMode"
                  value="ai-response"
                  checked={microphoneMode === 'ai-response'}
                  onChange={() => onMicrophoneModeChange('ai-response')}
                  style={styles.radio}
                />
                <div style={styles.radioContent}>
                  <div style={styles.radioTitle}>
                    🚀 Generar Respuesta con IA (Tiempo Real)
                  </div>
                  <div style={styles.radioDescription}>
                    Usa GPT Realtime API para respuestas ultra-rápidas. Latencia: ~300-500ms
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* System Prompt (solo visible en modo AI) */}
          {microphoneMode === 'ai-response' && (
            <>
              <section style={styles.section}>
                <div style={styles.labelRow}>
                  <label style={styles.sectionLabel}>Prompt del Sistema (GPT Realtime)</label>
                  <button onClick={handleReset} style={styles.resetButton}>
                    Restaurar por defecto
                  </button>
                </div>
                <textarea
                  value={localPrompt}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  placeholder="Instrucciones para el modelo de IA..."
                  style={styles.textarea}
                  rows={6}
                />
                <p style={styles.hint}>
                  💡 Define cómo responderá la IA a tus mensajes de voz
                </p>
              </section>

              {/* Envío Automático */}
              <section style={styles.section}>
                <label style={styles.sectionLabel}>Comportamiento de la Respuesta</label>
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      checked={autoSendAiResponse}
                      onChange={(e) => onAutoSendAiResponseChange(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <div style={styles.checkboxContent}>
                      <div style={styles.checkboxTitle}>
                        ⚡ Enviar automáticamente al avatar
                      </div>
                      <div style={styles.checkboxDescription}>
                        La respuesta de la IA se envía directamente al avatar sin pasar por el cuadro de texto.
                        Útil para conversaciones fluidas sin revisión manual.
                      </div>
                    </div>
                  </label>
                </div>
                <p style={styles.hint}>
                  {autoSendAiResponse
                    ? '⚡ Modo conversación directa: La IA responderá y hablará inmediatamente'
                    : '✏️ Modo revisión: Podrás editar la respuesta antes de enviarla al avatar'}
                </p>
              </section>
            </>
          )}

          {/* Avatar ID */}
          <section style={styles.section}>
            <label style={styles.sectionLabel}>Avatar ID de HeyGen</label>
            <input
              type="text"
              value={avatarId}
              onChange={(e) => onAvatarIdChange(e.target.value)}
              placeholder="Ej: 387942d848f74d7da37715583bf3929c"
              style={styles.input}
            />
            <p style={styles.hint}>
              💡 Obtén el Avatar ID desde <a href="https://app.heygen.com/" target="_blank" rel="noopener noreferrer" style={styles.link}>HeyGen Studio</a>
            </p>
          </section>

          {/* Voice ID */}
          <section style={styles.section}>
            <label style={styles.sectionLabel}>Voice ID de HeyGen</label>
            <input
              type="text"
              value={voiceId}
              onChange={(e) => onVoiceIdChange(e.target.value)}
              placeholder="Ej: 763f160b801a4c04bbb022a1a1f7dad8"
              style={styles.input}
            />
            <p style={styles.hint}>
              💡 Voz actual: Español. Obtén más voces desde <a href="https://app.heygen.com/" target="_blank" rel="noopener noreferrer" style={styles.link}>HeyGen Voice Library</a>
            </p>
          </section>

          {/* Formato de Video */}
          <section style={styles.section}>
            <label style={styles.sectionLabel}>Formato del Video</label>
            <select
              value={aspectRatio}
              onChange={(e) => onAspectRatioChange(e.target.value as AspectRatio)}
              style={styles.select}
            >
              <option value="16:9">🖥️ Horizontal (16:9)</option>
              <option value="9:16">📱 Vertical (9:16) - Stories</option>
              <option value="4:5">📱 Vertical Corto (4:5)</option>
              <option value="1:1">⬜ Cuadrado (1:1)</option>
              <option value="4:3">📺 Clásico (4:3)</option>
            </select>
            <p style={styles.hint}>
              💡 El video se recortará para ajustarse al formato seleccionado
            </p>
          </section>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancelar
          </button>
          <button onClick={handleSave} style={styles.saveButton}>
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
