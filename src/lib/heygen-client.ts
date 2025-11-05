import {
  StreamingAvatarApi,
  Configuration,
  NewSessionData,
} from "@heygen/streaming-avatar";

type EventCallback = (event: any) => void;

// Eventos disponibles según el SDK
export enum StreamingEvents {
  AVATAR_START_TALKING = "avatar_start_talking",
  AVATAR_STOP_TALKING = "avatar_stop_talking",
  STREAM_READY = "stream_ready",
  STREAM_DISCONNECTED = "stream_disconnected",
  USER_START = "user_start",
  USER_STOP = "user_stop",
}

export class HeyGenClient {
  private avatar: StreamingAvatarApi | null = null;
  private sessionData: NewSessionData | null = null;
  private callbacks: Map<string, EventCallback[]> = new Map();
  private mediaStream: MediaStream | null = null;

  /**
   * Inicializa el cliente HeyGen con el token de autenticación
   */
  async initialize(token: string): Promise<void> {
    try {
      // Crear configuración con el token
      const config = new Configuration({
        accessToken: token,
      });

      // Crear instancia del avatar
      this.avatar = new StreamingAvatarApi(config);

      console.log("✅ HeyGen client initialized");
    } catch (error) {
      console.error("❌ Error initializing HeyGen client:", error);
      throw new Error("Failed to initialize HeyGen client");
    }
  }

  /**
   * Inicia una sesión con el avatar
   */
  async startSession(avatarId: string, voiceId?: string): Promise<string> {
    if (!this.avatar) {
      throw new Error("Avatar not initialized. Call initialize() first.");
    }

    try {
      const defaultVoiceId = "763f160b801a4c04bbb022a1a1f7dad8"; // Voz en español por defecto
      const finalVoiceId = voiceId || defaultVoiceId;

      console.log(`🚀 Starting session with avatar: ${avatarId}, voice: ${finalVoiceId}`);

      // Crear y empezar avatar según el README del paquete
      this.sessionData = await this.avatar.createStartAvatar(
        {
          newSessionRequest: {
            quality: "high",
            avatarName: avatarId,
            voice: {
              voiceId: finalVoiceId,
              rate: 1.0,
            },
          },
        },
        (message: string) => {
          console.log("📊 Debug stream:", message);
        }
      );

      // El SDK maneja WebRTC internamente, solo necesitamos acceder al stream
      // @ts-ignore - accessing internal property
      if (this.sessionData && this.avatar.mediaStream) {
        // @ts-ignore
        this.mediaStream = this.avatar.mediaStream;
        console.log("✅ MediaStream captured");
        this.emit(StreamingEvents.STREAM_READY, { detail: this.mediaStream });
      }

      console.log(`✅ Session started`, this.sessionData);
      return this.sessionData?.sessionId || "";
    } catch (error) {
      console.error("❌ Error starting session:", error);
      throw new Error("Failed to start avatar session");
    }
  }

  /**
   * Hace que el avatar hable el texto proporcionado
   */
  async speak(text: string): Promise<void> {
    if (!this.avatar || !this.sessionData) {
      throw new Error("No active session. Call startSession() first.");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    try {
      console.log(
        `📢 Speaking: "${text.substring(0, 50)}${
          text.length > 50 ? "..." : ""
        }"`
      );

      this.emit(StreamingEvents.AVATAR_START_TALKING, {});

      // Debug: verificar que tenemos session_id
      console.log("📋 Session ID:", this.sessionData.sessionId);

      await this.avatar.speak({
        taskRequest: {
          text: text.trim(),
          sessionId: this.sessionData.sessionId, // ← Cambio: sessionId en lugar de session_id
          taskType: "repeat", // El avatar repetirá exactamente el texto
        },
      });

      console.log("✅ Speech command sent");

      // Simular evento de parada después de un tiempo
      setTimeout(() => {
        this.emit(StreamingEvents.AVATAR_STOP_TALKING, {});
      }, 2000);
    } catch (error) {
      this.emit(StreamingEvents.AVATAR_STOP_TALKING, {});
      console.error("❌ Error speaking:", error);
      throw new Error("Failed to make avatar speak");
    }
  }

  /**
   * Interrumpe el habla actual del avatar
   */
  async interrupt(): Promise<void> {
    if (!this.avatar || !this.sessionData) {
      throw new Error("Avatar not initialized");
    }

    try {
      await this.avatar.interrupt({
        interruptRequest: {
          sessionId: this.sessionData.sessionId,
        },
      });
      console.log("⏹️ Avatar interrupted");
      this.emit(StreamingEvents.AVATAR_STOP_TALKING, {});
    } catch (error) {
      console.error("❌ Error interrupting:", error);
      throw new Error("Failed to interrupt avatar");
    }
  }

  /**
   * Detiene la sesión del avatar
   */
  async stopSession(): Promise<void> {
    if (this.avatar && this.sessionData) {
      try {
        await this.avatar.stopAvatar(
          {
            stopSessionRequest: {
              sessionId: this.sessionData.sessionId,
            },
          },
          (message: string) => {
            console.log("📊 Stop debug:", message);
          }
        );
        console.log("🛑 Session stopped");
        this.sessionData = null;
        this.mediaStream = null;
        this.emit(StreamingEvents.STREAM_DISCONNECTED, {});
      } catch (error) {
        console.error("❌ Error stopping session:", error);
        throw new Error("Failed to stop avatar session");
      }
    }
  }

  /**
   * Obtiene el MediaStream del avatar para renderizado
   */
  getMediaStream(): MediaStream | null {
    // Intentar obtener el stream del avatar si no lo tenemos
    if (!this.mediaStream && this.avatar) {
      // @ts-ignore - accessing internal property
      this.mediaStream = this.avatar.mediaStream || null;
    }
    return this.mediaStream;
  }

  /**
   * Verifica si hay una sesión activa
   */
  isSessionActive(): boolean {
    return this.sessionData !== null;
  }

  /**
   * Obtiene el ID de la sesión actual
   */
  getSessionId(): string | null {
    return this.sessionData?.sessionId || null;
  }

  /**
   * Registra un callback para un evento específico
   */
  on(event: StreamingEvents, callback: EventCallback): void {
    const eventName = event.toString();
    if (!this.callbacks.has(eventName)) {
      this.callbacks.set(eventName, []);
    }
    this.callbacks.get(eventName)!.push(callback);
  }

  /**
   * Emite un evento a todos los callbacks registrados
   */
  private emit(event: StreamingEvents, data: any): void {
    const eventName = event.toString();
    const callbacks = this.callbacks.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Limpia todos los listeners
   */
  cleanup(): void {
    this.callbacks.clear();
    this.sessionData = null;
    this.mediaStream = null;
  }
}
