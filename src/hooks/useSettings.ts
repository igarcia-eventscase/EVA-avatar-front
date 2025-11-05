import { useState, useEffect } from 'react';
import type { MicrophoneMode, AspectRatio } from '@/components/SettingsModal';

export const DEFAULT_SYSTEM_PROMPT =
  'Eres un asistente virtual para eventos. Responde de manera MUY CONCISA en español, máximo 2-3 oraciones. ' +
  'Tus respuestas serán leídas en voz alta por un avatar, así que deben ser naturales para hablar ' +
  '(evita usar emojis, asteriscos o formato especial). ' +
  'Sé breve, directo y amigable.';

const DEFAULT_AVATAR_ID = import.meta.env.VITE_AVATAR_ID || 'default';
const DEFAULT_VOICE_ID = 'alloy'; // OpenAI Realtime API voice (neutral, funciona en español)

interface Settings {
  aspectRatio: AspectRatio;
  microphoneMode: MicrophoneMode;
  systemPrompt: string;
  autoSendAiResponse: boolean;
  avatarId: string;
  voiceId: string;
}

const STORAGE_KEY = 'eva-avatar-settings';

const DEFAULT_SETTINGS: Settings = {
  aspectRatio: '16:9',
  microphoneMode: 'transcribe',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  autoSendAiResponse: false,
  avatarId: DEFAULT_AVATAR_ID,
  voiceId: DEFAULT_VOICE_ID,
};

/**
 * Custom hook para manejar configuraciones con persistencia en localStorage
 */
export function useSettings() {
  // Inicializar con valores de localStorage o defaults
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validar que tenga todas las propiedades necesarias
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Guardar en localStorage cada vez que cambien las configuraciones
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [settings]);

  // Funciones para actualizar configuraciones individuales
  const setAspectRatio = (aspectRatio: AspectRatio) => {
    setSettings((prev) => ({ ...prev, aspectRatio }));
  };

  const setMicrophoneMode = (microphoneMode: MicrophoneMode) => {
    setSettings((prev) => ({ ...prev, microphoneMode }));
  };

  const setSystemPrompt = (systemPrompt: string) => {
    setSettings((prev) => ({ ...prev, systemPrompt }));
  };

  const setAutoSendAiResponse = (autoSendAiResponse: boolean) => {
    setSettings((prev) => ({ ...prev, autoSendAiResponse }));
  };

  const setAvatarId = (avatarId: string) => {
    setSettings((prev) => ({ ...prev, avatarId }));
  };

  const setVoiceId = (voiceId: string) => {
    setSettings((prev) => ({ ...prev, voiceId }));
  };

  // Función para resetear todas las configuraciones
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    // Valores
    aspectRatio: settings.aspectRatio,
    microphoneMode: settings.microphoneMode,
    systemPrompt: settings.systemPrompt,
    autoSendAiResponse: settings.autoSendAiResponse,
    avatarId: settings.avatarId,
    voiceId: settings.voiceId,
    // Setters
    setAspectRatio,
    setMicrophoneMode,
    setSystemPrompt,
    setAutoSendAiResponse,
    setAvatarId,
    setVoiceId,
    resetSettings,
  };
}
