import { CSSProperties } from 'react';

export const charCount = (isOverLimit: boolean): CSSProperties => ({
  fontSize: '13px',
  color: isOverLimit ? '#ef4444' : 'rgba(255, 255, 255, 0.5)',
  fontWeight: isOverLimit ? 600 : 400,
});

export const styles: Record<string, CSSProperties> = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    maxHeight: '300px',
    padding: '12px',
    fontSize: '15px',
    lineHeight: '1.5',
    resize: 'none',
    fontFamily: 'inherit',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    backgroundColor: '#2a2a2a',
    color: 'rgba(255, 255, 255, 0.9)',
    transition: 'border-color 0.2s',
  },
  textareaDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  hintIcon: {
    fontSize: '16px',
  },
  hintText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  kbd: {
    padding: '2px 6px',
    fontSize: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    fontSize: '15px',
    fontWeight: 500,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonActive: {
    backgroundColor: '#646cff',
    color: 'white',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
    cursor: 'not-allowed',
  },
  buttonIcon: {
    fontSize: '18px',
  },
  spinner: {
    width: '14px',
    height: '14px',
    borderWidth: '2px',
  },
  disabledMessage: {
    padding: '12px',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    border: '1px solid rgba(234, 179, 8, 0.3)',
    borderRadius: '8px',
    color: '#fbbf24',
    fontSize: '14px',
    textAlign: 'center',
  },
};
