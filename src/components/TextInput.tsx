import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { styles, charCount as charCountStyle } from './styles/TextInput.styles';

interface TextInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  disabled: boolean;
  externalText?: string; // Texto inyectado desde afuera (voz)
}

export interface TextInputRef {
  focus: () => void;
}

export const TextInput = forwardRef<TextInputRef, TextInputProps>(
  ({ onSubmit, isProcessing, disabled, externalText }, ref) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Exponer método focus al componente padre
    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

  // Cuando se recibe texto externo (desde voz), actualizarlo
  useEffect(() => {
    if (externalText) {
      setText(externalText);

      // Auto-resize del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        // Hacer foco en el textarea para que el usuario pueda editar
        textareaRef.current.focus();
      }
    }
  }, [externalText]);

  const handleSubmit = () => {
    const trimmedText = text.trim();
    if (trimmedText && !isProcessing && !disabled) {
      onSubmit(trimmedText);
      setText('');

      // Reset textarea height y mantener foco
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // Mantener el foco en el textarea para seguir escribiendo
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter para enviar
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const canSubmit = text.trim().length > 0 && !isProcessing && !disabled;
  const charCount = text.length;
  const maxChars = 1000; // Límite razonable

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Mensaje para el Avatar</h3>
        <div style={charCountStyle(charCount > maxChars)}>
          {charCount} / {maxChars}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Escribe el mensaje que el avatar dirá en voz alta... Click en TAB ->| para hacer foco aqui."
        style={{
          ...styles.textarea,
          ...(disabled ? styles.textareaDisabled : {}),
        }}
        disabled={disabled || isProcessing}
        rows={8}
      />

      <div style={styles.footer}>
        <div style={styles.hint}>
          <span style={styles.hintIcon}>💡</span>
          <span style={styles.hintText}>
            Presiona <kbd style={styles.kbd}>Ctrl</kbd> + <kbd style={styles.kbd}>Enter</kbd> para enviar
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            ...styles.button,
            ...(canSubmit ? styles.buttonActive : styles.buttonDisabled),
          }}
        >
          {isProcessing ? (
            <>
              <span className="spinner" style={styles.spinner}></span>
              Procesando...
            </>
          ) : (
            <>
              <span style={styles.buttonIcon}>📢</span>
              Enviar
            </>
          )}
        </button>
      </div>

      {disabled && (
        <div style={styles.disabledMessage}>
          ⚠️ Conecta el avatar primero para poder enviar mensajes
        </div>
      )}
    </div>
  );
});

TextInput.displayName = 'TextInput';
