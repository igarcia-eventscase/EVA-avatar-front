import { useState, useEffect, useRef, useCallback } from 'react';
import { HeyGenClient, StreamingEvents } from '@/lib/heygen-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UseHeyGenReturn {
  isInitialized: boolean;
  isConnected: boolean;
  isSpeaking: boolean;
  error: string | null;
  mediaStream: MediaStream | null;
  initialize: (avatarId: string, voiceId?: string) => Promise<void>;
  speak: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useHeyGen(): UseHeyGenReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const clientRef = useRef<HeyGenClient | null>(null);

  /**
   * Obtiene el token de HeyGen del backend
   */
  const fetchToken = async (): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/api/heygen/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.token;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Error fetching token: ${message}`);
    }
  };

  /**
   * Inicializa el cliente HeyGen e inicia la sesión
   */
  const initialize = useCallback(async (avatarId: string, voiceId?: string) => {
    try {
      setError(null);
      console.log('🔄 Initializing HeyGen...');

      // Obtener token del backend
      const token = await fetchToken();

      // Crear y inicializar cliente
      const client = new HeyGenClient();
      await client.initialize(token);

      // Configurar event listeners
      client.on(StreamingEvents.STREAM_READY, () => {
        setMediaStream(client.getMediaStream());
        setIsConnected(true);
      });

      client.on(StreamingEvents.AVATAR_START_TALKING, () => {
        setIsSpeaking(true);
      });

      client.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setIsSpeaking(false);
      });

      client.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setIsConnected(false);
        setMediaStream(null);
      });

      // Guardar referencia
      clientRef.current = client;
      setIsInitialized(true);

      // Iniciar sesión con el avatar y la voz
      await client.startSession(avatarId, voiceId);

      console.log('✅ HeyGen initialized successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('❌ Error initializing HeyGen:', err);
    }
  }, []);

  /**
   * Hace que el avatar hable
   */
  const speak = useCallback(async (text: string) => {
    if (!clientRef.current) {
      setError('Client not initialized');
      return;
    }

    try {
      setError(null);
      await clientRef.current.speak(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('❌ Error speaking:', err);
    }
  }, []);

  /**
   * Interrumpe el habla actual
   */
  const interrupt = useCallback(async () => {
    if (!clientRef.current) {
      return;
    }

    try {
      await clientRef.current.interrupt();
    } catch (err) {
      console.error('❌ Error interrupting:', err);
    }
  }, []);

  /**
   * Desconecta y limpia
   */
  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.stopSession();
        clientRef.current.cleanup();
        clientRef.current = null;

        setIsInitialized(false);
        setIsConnected(false);
        setIsSpeaking(false);
        setMediaStream(null);
        setError(null);

        console.log('✅ Disconnected from HeyGen');
      } catch (err) {
        console.error('❌ Error disconnecting:', err);
      }
    }
  }, []);

  // Cleanup on unmount and page unload
  useEffect(() => {
    // Función para cerrar sesión
    const closeSession = async () => {
      if (clientRef.current && clientRef.current.isSessionActive()) {
        console.log('🧹 Cleaning up HeyGen session...');
        try {
          await clientRef.current.stopSession();
          clientRef.current.cleanup();
          console.log('✅ Session cleaned up');
        } catch (err) {
          console.error('❌ Error cleaning up session:', err);
        }
      }
    };

    // Listener para cuando se cierra/recarga la página
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (clientRef.current && clientRef.current.isSessionActive()) {
        // Intentar cerrar sesión de forma síncrona
        closeSession();

        // Nota: beforeunload tiene limitaciones, pero al menos lo intentamos
        e.preventDefault();
      }
    };

    // Registrar listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup cuando se desmonta el componente
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      closeSession();
    };
  }, []);

  return {
    isInitialized,
    isConnected,
    isSpeaking,
    error,
    mediaStream,
    initialize,
    speak,
    interrupt,
    disconnect,
  };
}
