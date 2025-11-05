import { useState, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface UseRealtimeAIReturn {
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

// Tipos de eventos del WebRTC data channel
interface RealtimeEvent {
  type: string;
  [key: string]: any;
}

export function useRealtimeAI(): UseRealtimeAIReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const systemPromptRef = useRef<string>("");
  const accumulatedTextRef = useRef<string>("");

  /**
   * Manejar eventos del data channel
   */
  const handleRealtimeEvent = (event: RealtimeEvent) => {
    console.log("📥 Evento Realtime:", event.type);

    switch (event.type) {
      case "session.created":
      case "session.updated":
        console.log("✅ Sesión lista");
        break;

      case "input_audio_buffer.speech_started":
        console.log("🎤 Detectado inicio de habla");
        break;

      case "input_audio_buffer.speech_stopped":
        console.log("🛑 Detectado fin de habla");
        setIsProcessing(true);
        break;

      case "conversation.item.input_audio_transcription.completed":
        // Transcripción del usuario
        const userTranscript = event.transcript || "";
        console.log("📝 Transcripción usuario:", userTranscript);
        setTranscription(userTranscript);
        break;

      case "response.output_text.delta":
        // Texto parcial de la respuesta (streaming) - modelo gpt-realtime
        const delta = event.delta || "";
        accumulatedTextRef.current += delta;
        console.log("📤 Texto delta:", delta);
        break;

      case "response.output_text.done":
        // Texto completo de la respuesta - modelo gpt-realtime
        const finalText = event.text || accumulatedTextRef.current;
        console.log("✅ Respuesta completa:", finalText);
        setResponse(finalText);
        setIsProcessing(false);
        accumulatedTextRef.current = "";
        break;

      case "response.done":
        console.log("✅ Respuesta finalizada");
        setIsProcessing(false);
        break;

      case "error":
        console.error("❌ Error de Realtime API:", event.error);
        setError(event.error?.message || "Error desconocido");
        setIsProcessing(false);
        break;

      default:
        // Ignorar otros eventos
        break;
    }
  };

  /**
   * Establecer conexión WebRTC con OpenAI
   */
  const establishWebRTCConnection = useCallback(async (): Promise<void> => {
    try {
      // Solicitar permiso de micrófono
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = mediaStream;

      // Crear peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Añadir track de audio del micrófono
      mediaStream.getTracks().forEach((track) => {
        pc.addTrack(track, mediaStream);
      });

      // Crear data channel para eventos
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      // Configurar listeners del data channel
      dc.onopen = () => {
        console.log("📡 Data channel abierto");

        // Usar system prompt del ref (configurable desde la UI)
        const instructions =
          systemPromptRef.current ||
          "Eres un asistente virtual para eventos. Responde de manera MUY CONCISA en español, máximo 2-3 oraciones. " +
            "Tus respuestas serán leídas en voz alta por un avatar, así que deben ser naturales para hablar " +
            "(evita usar emojis, asteriscos o formato especial). " +
            "Sé breve, directo y amigable.";

        // Voice fijo para OpenAI Realtime API (NO configurable - el voice del avatar es de HeyGen)
        const voice = "alloy"; // Voz neutral de OpenAI

        // Configurar sesión siguiendo estructura oficial de OpenAI
        // Las instructions DEBEN enviarse aquí en el data channel
        const sessionUpdate = {
          type: "session.update",
          session: {
            type: "realtime",
            model: "gpt-realtime", // Modelo GA más reciente
            instructions, // ← System prompt configurado AQUÍ (incluye límite de longitud)
            output_modalities: ["text"], // Solo texto, SIN audio
            max_output_tokens: 100, // ← Límite de tokens (aprox 2-3 oraciones en español)
            // Balance entre creatividad y consistencia
            audio: {
              input: {
                format: {
                  type: "audio/pcm",
                  rate: 24000,
                },
                turn_detection: {
                  type: "semantic_vad", // VAD semántico (solo gpt-realtime)
                },
              },
              output: {
                voice, // ← Voice ID fijo
              },
            },
          },
        };

        console.log("📤 Enviando session.update CON instructions:");
        console.log(
          "  📋 Instructions:",
          instructions.substring(0, 60) + "..."
        );
        console.log("  🎙️ Voice:", voice);
        dc.send(JSON.stringify(sessionUpdate));
      };

      dc.onmessage = (e) => {
        try {
          const event: RealtimeEvent = JSON.parse(e.data);
          handleRealtimeEvent(event);
        } catch (err) {
          console.error("❌ Error parsing data channel message:", err);
        }
      };

      dc.onerror = (error) => {
        console.error("❌ Data channel error:", error);
        setError("Error en data channel");
      };

      dc.onclose = () => {
        console.log("📡 Data channel cerrado");
      };

      // Crear SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("📤 Enviando SDP offer al backend...");
      console.log("  📋 Instructions se enviarán en el data channel");
      console.log(
        "  📋 System Prompt:",
        systemPromptRef.current.substring(0, 60) + "..."
      );

      // Enviar SDP al backend (solo SDP, sin JSON)
      const sdpResponse = await fetch(`${API_URL}/api/realtime/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpResponse.ok) {
        throw new Error(`Backend error: ${sdpResponse.status}`);
      }

      const answerSDP = await sdpResponse.text();
      console.log("📥 SDP answer recibido del backend");

      // Establecer remote description
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: answerSDP,
      };

      await pc.setRemoteDescription(answer);
      console.log("✅ Conexión WebRTC establecida");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error estableciendo conexión: ${message}`);
      console.error("❌ Error en WebRTC:", err);
      throw err;
    }
  }, []);

  /**
   * Cerrar completamente la conexión WebRTC
   */
  const closeConnection = useCallback(() => {
    // Cerrar data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Cerrar peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Detener media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    console.log("🧹 Conexión WebRTC cerrada");
  }, []);

  /**
   * Limpiar resultados visuales (SIN cerrar conexión WebRTC)
   */
  const clearResults = useCallback(() => {
    setTranscription(null);
    setResponse(null);
    setError(null);
    accumulatedTextRef.current = "";
    console.log("🧹 Estados visuales limpiados (conexión WebRTC activa)");
  }, []);

  /**
   * Iniciar grabación
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscription(null);
      setResponse(null);
      accumulatedTextRef.current = "";

      // Establecer conexión WebRTC
      await establishWebRTCConnection();

      setIsRecording(true);
      console.log("🎤 Grabación iniciada (Realtime API vía WebRTC)");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error al iniciar grabación: ${message}`);
      console.error("❌ Error al iniciar grabación:", err);
    }
  }, [establishWebRTCConnection]);

  /**
   * Detener grabación y cerrar conexión
   */
  const stopRecording = useCallback(async () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);
      console.log("🛑 Grabación detenida, cerrando conexión...");

      // Cerrar toda la conexión WebRTC
      closeConnection();
    } catch (err) {
      console.error("❌ Error al detener grabación:", err);
    }
  }, [isRecording, closeConnection]);

  /**
   * Configurar system prompt
   * Se enviará a OpenAI a través del data channel al iniciar la próxima sesión
   */
  const setSystemPrompt = useCallback((prompt: string) => {
    systemPromptRef.current = prompt;
    console.log("✅ System prompt guardado:", prompt.substring(0, 60) + "...");
    console.log(
      "💡 Se enviará a OpenAI en la próxima conexión (via data channel)"
    );
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
