import { useState, useRef, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UseVoiceInputReturn {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  transcription: string | null;
  response: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearResults: () => void;
  setSystemPrompt: (prompt: string) => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const systemPromptRef = useRef<string>('');

  /**
   * Inicia la grabación de audio
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscription(null);
      setResponse(null);

      // Solicitar permiso de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Crear MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      // Event listener para guardar chunks de audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Event listener para cuando se detiene la grabación
      mediaRecorder.onstop = async () => {
        console.log('🎤 Grabación detenida, procesando...');
        await processAudio();

        // Detener todos los tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      console.log('🎤 Grabación iniciada');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al iniciar grabación: ${message}`);
      console.error('❌ Error al iniciar grabación:', err);
    }
  }, []);

  /**
   * Detiene la grabación de audio
   */
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  /**
   * Procesa el audio grabado: envía al backend y recibe transcripción + respuesta
   */
  const processAudio = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Crear blob de audio
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('📦 Audio blob creado, tamaño:', audioBlob.size, 'bytes');

      // Convertir a base64
      const base64Audio = await blobToBase64(audioBlob);

      // Enviar al backend
      console.log('📤 Enviando audio al backend...');
      const response = await fetch(`${API_URL}/api/openai/voice-to-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          systemPrompt: systemPromptRef.current || undefined, // Enviar solo si existe
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta recibida del backend');
      console.log('📝 Transcripción:', data.transcription);
      console.log('🤖 Respuesta:', data.response);

      setTranscription(data.transcription);
      setResponse(data.response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error procesando audio: ${message}`);
      console.error('❌ Error procesando audio:', err);
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  /**
   * Convierte un Blob a base64
   */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remover el prefijo "data:audio/webm;base64,"
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Error convirtiendo a base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /**
   * Limpia los resultados
   */
  const clearResults = useCallback(() => {
    setTranscription(null);
    setResponse(null);
    setError(null);
  }, []);

  /**
   * Configura el system prompt para GPT
   */
  const setSystemPrompt = useCallback((prompt: string) => {
    systemPromptRef.current = prompt;
  }, []);

  return {
    isRecording,
    isProcessing,
    error,
    transcription,
    response,
    startRecording,
    stopRecording,
    clearResults,
    setSystemPrompt,
  };
}
