import { useState, useCallback, useRef, useEffect } from 'react';
import { AvatarViewer } from './components/AvatarViewer';
import { TextInput, type TextInputRef } from './components/TextInput';
import { UnifiedVoiceInput } from './components/UnifiedVoiceInput';
import { SettingsModal } from './components/SettingsModal';
import { useHeyGen } from './hooks/useHeyGen';
import { useSettings } from './hooks/useSettings';
import { styles } from './components/styles/App.styles';

function App() {
  const {
    isInitialized,
    isConnected,
    isSpeaking,
    error,
    mediaStream,
    initialize,
    speak,
    disconnect,
  } = useHeyGen();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ref para el componente TextInput
  const textInputRef = useRef<TextInputRef>(null);

  // Configuraciones persistentes en localStorage
  const {
    aspectRatio,
    microphoneMode,
    systemPrompt,
    autoSendAiResponse,
    avatarId,
    voiceId,
    setAspectRatio,
    setMicrophoneMode,
    setSystemPrompt,
    setAutoSendAiResponse,
    setAvatarId,
    setVoiceId,
  } = useSettings();

  // Estados de entrada
  const [voiceText, setVoiceText] = useState<string>('');

  // Listener global para la tecla Tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Si se presiona Tab y no estamos en el modal de configuración
      if (e.key === 'Tab' && !isSettingsOpen) {
        e.preventDefault(); // Prevenir comportamiento por defecto de Tab
        textInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen]);

  const handleConnect = async () => {
    if (isInitialized) {
      await disconnect();
    } else {
      setIsInitializing(true);
      try {
        await initialize(avatarId, voiceId);
      } finally {
        setIsInitializing(false);
      }
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    await speak(text);
  }, [speak]);

  const handleAutoSend = useCallback(async (text: string) => {
    // Envío automático: enviar directamente al avatar
    await speak(text);
  }, [speak]);

  const handleVoiceTextReceived = useCallback((text: string) => {
    setVoiceText(text);
  }, []);

  return (
    <div style={styles.app}>
      {/* Main Content */}
      <div style={styles.container}>
        {/* Control Panel */}
        <div style={styles.controlPanel}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Panel de Control</h2>

            {/* Connection & Settings */}
            <div style={styles.buttonGroup}>
              <button
                onClick={handleConnect}
                disabled={isInitializing}
                style={{
                  ...styles.connectButton,
                  ...(isConnected ? styles.connectButtonActive : {}),
                  ...(isInitializing ? styles.connectButtonLoading : {}),
                }}
              >
                {isInitializing ? (
                  <>
                    <span className="spinner" style={styles.spinner}></span>
                    Conectando...
                  </>
                ) : isConnected ? (
                  <>
                    <span style={styles.statusDotConnected}></span>
                    Desconectar
                  </>
                ) : (
                  <>
                    <span style={styles.statusDotDisconnected}></span>
                    Conectar
                  </>
                )}
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                style={styles.settingsButton}
              >
                ⚙️
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠️</span>
                <div style={styles.errorContent}>
                  <div style={styles.errorTitle}>Error</div>
                  <div style={styles.errorMessage}>{error}</div>
                </div>
              </div>
            )}
          </div>

          {/* Voice Input - Modo unificado */}
          <div style={styles.section}>
            <UnifiedVoiceInput
              onTextReceived={handleVoiceTextReceived}
              onAutoSend={handleAutoSend}
              disabled={!isConnected}
              mode={microphoneMode}
              systemPrompt={systemPrompt}
              autoSendEnabled={autoSendAiResponse}
            />
          </div>

          {/* Text Input */}
          <div style={styles.section}>
            <TextInput
              ref={textInputRef}
              onSubmit={handleSendMessage}
              isProcessing={isSpeaking}
              disabled={!isConnected}
              externalText={voiceText}
            />
          </div>

          {/* Info */}
          <div style={styles.infoBox}>
            <h3 style={styles.infoTitle}>📌 Instrucciones</h3>
            <ol style={styles.infoList}>
              <li>Conecta el avatar</li>
              <li>Usa el micrófono o escribe directamente</li>
              <li>Presiona "Enviar" o usa Ctrl+Enter</li>
              <li>Abre ⚙️ para cambiar configuración</li>
            </ol>
          </div>
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          microphoneMode={microphoneMode}
          onMicrophoneModeChange={setMicrophoneMode}
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          autoSendAiResponse={autoSendAiResponse}
          onAutoSendAiResponseChange={setAutoSendAiResponse}
          avatarId={avatarId}
          onAvatarIdChange={setAvatarId}
          voiceId={voiceId}
          onVoiceIdChange={setVoiceId}
        />

        {/* Avatar Display */}
        <div style={styles.avatarPanel}>
          <div style={styles.avatarContainer}>
            <AvatarViewer
              mediaStream={mediaStream}
              isConnected={isConnected}
              isSpeaking={isSpeaking}
              aspectRatio={aspectRatio}
            />
          </div>

          <div style={styles.projectionHint}>
            💡 Esta área puede proyectarse en pantallas de eventos
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
