import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaRobot, FaTimes, FaExpand } from 'react-icons/fa';
import classes from './ChatbotWidget.module.scss';
import ChatbotAgent from '@components/ChatbotAgent/ChatbotAgent';

interface ChatbotWidgetProps {
  onExpand?: () => void;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    setIsExpanded(true);
    if (onExpand) onExpand();
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  if (isExpanded) {
    return (
      <div className={classes['chatbot-widget-expanded']}>
        <div className={classes['widget-header']}>
          <div className={classes['widget-title']}>
            <FaRobot size={16} />
            <span>Asistente de Comercio Exterior</span>
          </div>
          <div className={classes['widget-controls']}>
            <Button variant="link" size="sm" onClick={handleClose}>
              <FaTimes size={12} />
            </Button>
          </div>
        </div>
        <div className={classes['widget-content']}>
          <ChatbotAgent isWidget={true} onClose={handleClose} />
        </div>
      </div>
    );
  }

  return (
    <Card className={classes['chatbot-widget-card']}>
      <Card.Header className={classes['widget-card-header']}>
        <div className={classes['widget-card-title']}>
          <FaRobot size={18} />
          <span>Asistente IA</span>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          onClick={handleExpand}
          className={classes['expand-button']}
        >
          <FaExpand size={14} />
        </Button>
      </Card.Header>
      <Card.Body className={classes['widget-card-body']}>
        <div className={classes['widget-description']}>
          <p>¿Necesitas ayuda con operaciones de comercio exterior?</p>
          <p className={classes['widget-features']}>
            • Consultas sobre operaciones<br/>
            • Estado de tareas<br/>
            • Información de clientes y proveedores<br/>
            • Regulaciones aduaneras
          </p>
        </div>
        <Button 
          variant="primary" 
          className={classes['chat-button']}
          onClick={handleExpand}
        >
          <FaRobot className="me-2" />
          Iniciar Chat
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ChatbotWidget;
