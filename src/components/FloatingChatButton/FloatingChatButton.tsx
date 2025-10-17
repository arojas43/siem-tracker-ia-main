import React, { useMemo, useState, useRef, useEffect } from 'react';
import { DeepChat } from 'deep-chat-react';
import styles from './FloatingChatButton.module.scss';

interface FloatingChatButtonProps {
  className?: string;
  jwtToken?: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ className, jwtToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);

  const chatbotBase = useMemo(() => {
    const envBase =
      ((import.meta.env.VITE_CHATBOT_ENDPOINT as string | undefined) || '')
        .toString()
        .replace(/\/$/, '') ||
      ((import.meta.env.VITE_API_ENDPOINT as string | undefined) || '')
        .toString()
        .replace(/\/api\/?$/, '');
    return envBase;
  }, []);

  const authHeader = useMemo(() => {
    if (!jwtToken) return undefined;
    return { Authorization: `Bearer ${jwtToken}` };
  }, [jwtToken]);

  useEffect(() => {
    const chatEl = chatRef.current;
    if (!chatEl) return;

    chatEl.requestInterceptor = (message: any) => {
      setIsLoading(true);
      return message;
    };
    chatEl.responseInterceptor = () => {
      setIsLoading(false);
    };

    return () => {
      if (!chatEl) return;
      chatEl.requestInterceptor = undefined;
      chatEl.responseInterceptor = undefined;
    };
  }, [chatRef]);

  return (
    <div className={`${styles['floating-chat-trigger']} ${className || ''}`}> 
      {!isOpen && (
        <button
          className={styles['trigger-button']}
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3C6.486 3 2 6.589 2 11c0 2.389 1.324 4.534 3.414 6.03L4 21l4.22-1.689C9.451 19.77 10.708 20 12 20c5.514 0 10-3.589 10-8s-4.486-9-10-9zM8 11h8v2H8v-2zm0-4h8v2H8V7z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className={`${styles['floating-chat-container']} ${className || ''}`}>
          <div className={styles['chat-header']}>
            <div className={styles['header-content']}>
              <div className={styles['header-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.029 2 10.5c0 2.295 1.14 4.372 2.975 5.853L4 22l5.115-2.279C10.223 20.056 11.093 20.2 12 20.2c5.523 0 10-4.029 10-9.7S17.523 2 12 2z" />
                </svg>
              </div>
              <h3>Asistente de Comercio Exterior</h3>
            </div>
            <button className={styles['close-button']} onClick={() => setIsOpen(false)} aria-label="Cerrar">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.3 5.71L12 12.01 5.7 5.71 4.29 7.12l6.3 6.3-6.3 6.29 1.41 1.41 6.3-6.29 6.29 6.29 1.41-1.41-6.29-6.29 6.29-6.3z" />
              </svg>
            </button>
          </div>

          <div className={styles['chat-content']}>
            <DeepChat
              ref={chatRef}
              connect={{
                url: `${chatbotBase}/api/chatbot/deepchat`,
                method: 'POST',
                headers: authHeader,
                additionalBodyProps: {
                  jwt: jwtToken ?? '',
                  context: {
                    current_page: window.location.pathname,
                    force_llm: true,
                  }
                }
              }}
              textInput={{
                placeholder: { text: 'Escribe tu consulta sobre comercio exterior...' }
              }}
              introMessage={{
                text: '¡Hola! Soy tu asistente especializado en comercio exterior y aduanas. Puedo ayudarte con:\n\n• Consultas sobre importación/exportación\n• Información de clientes, proveedores y aduanas\n• Estado de tareas y procesos logísticos\n• Regulaciones aduaneras y documenta...'
              }}
              style={{ height: '100%', width: '100%' }}
            />
            <div className={styles['loading-overlay']} style={{ opacity: isLoading ? 1 : 0 }}>
              <span className={styles['typing-dot']} />
              <span className={styles['typing-dot']} />
              <span className={styles['typing-dot']} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatButton;
