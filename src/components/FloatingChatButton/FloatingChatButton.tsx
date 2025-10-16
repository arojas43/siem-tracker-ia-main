import React, { useState } from 'react';
import { DeepChat } from 'deep-chat-react';
import { useAppSelector } from '@hooks/reduxTyped.hooks';
import classes from './FloatingChatButton.module.scss';

interface FloatingChatButtonProps {
  className?: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const userInfo = useAppSelector((state) => state.userInfo);

  const chatbotBase = (
    (import.meta.env.VITE_CHATBOT_ENDPOINT as string | undefined) || ''
  )
    .toString()
    .replace(/\/$/, '') ||
    ((import.meta.env.VITE_API_ENDPOINT as string | undefined) || '')
      .toString()
      .replace(/\/api\/?$/, '');

  const authHeader = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const resolvedUserId =
    (userInfo?.email && userInfo.email.trim()) ||
    (userInfo?.username && userInfo.username.trim()) ||
    (userInfo?.id ? String(userInfo.id) : 'unknown');
  const resolvedUserType = userInfo?.userType === 'external' ? 'client' : 'siem';

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className={`${classes['floating-chat-trigger']} ${className || ''}`}>
        <button 
          onClick={handleOpen}
          className={classes['trigger-button']}
          title="Asistente IA - Comercio Exterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4L19 9Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`${classes['floating-chat-container']} ${className || ''}`}>
      <div className={classes['chat-header']}>
        <div className={classes['header-content']}>
          <div className={classes['header-icon']}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4L19 9Z" fill="currentColor"/>
            </svg>
          </div>
          <h3>Asistente de Comercio Exterior</h3>
        </div>
        <button 
          onClick={handleClose}
          className={classes['close-button']}
          title="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <div className={classes['chat-content']}>
        <DeepChat
          connect={{
            url: `${chatbotBase}/api/chatbot/deepchat`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader,
            },
            additionalBodyProps: {
              user_id: resolvedUserId,
              context: {
                user_type: resolvedUserType,
                current_page: window.location.pathname,
              }
            }
          }}
          textInput={{
            placeholder: {
              text: 'Escribe tu consulta sobre comercio exterior...'
            }
          }}
          introMessage={{
            text: '¡Hola! Soy tu asistente especializado en comercio exterior y aduanas. Puedo ayudarte con:\n\n• Consultas sobre operaciones de importación/exportación\n• Información sobre clientes, proveedores y aduanas\n• Estado de tareas y procesos logísticos\n• Regulaciones aduaneras y documentación\n• Análisis de datos de operaciones\n\n¿En qué puedo ayudarte hoy?'
          }}
          style={{
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            height: '100%',
            width: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default FloatingChatButton;
