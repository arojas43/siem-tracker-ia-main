import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaRobot, FaTimes, FaPaperPlane, FaMinus, FaExpand } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import classes from './ChatbotAgent.module.scss';
import { useAppSelector } from '@hooks/reduxTyped.hooks';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatbotAgentProps {
  isWidget?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onExpand?: () => void;
}

const ChatbotAgent: React.FC<ChatbotAgentProps> = ({ 
  isWidget = false, 
  onClose, 
  onMinimize, 
  onExpand 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${chatbotBase}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          message: userMessage.content,
          user_id: resolvedUserId,
          context: {
            user_type: resolvedUserType,
            current_page: window.location.pathname
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar la consulta');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu consulta. Por favor, inténtalo de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const openChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `¡Hola! Soy tu asistente especializado en comercio exterior y aduanas. Puedo ayudarte con:

• Consultas sobre operaciones de importación/exportación
• Información sobre clientes, proveedores y aduanas
• Estado de tareas y procesos logísticos
• Regulaciones aduaneras y documentación
• Análisis de datos de operaciones

¿En qué puedo ayudarte hoy?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const minimizeChat = () => {
    setIsOpen(false);
    if (onMinimize) onMinimize();
  };

  const expandChat = () => {
    if (onExpand) onExpand();
  };

  if (isWidget) {
    return (
      <div className={classes['chatbot-widget']}>
        {!isOpen ? (
          <Button 
            variant="primary" 
            className={classes['chatbot-trigger']}
            onClick={openChat}
          >
            <FaRobot size={20} />
            <span>Asistente IA</span>
          </Button>
        ) : (
          <div className={classes['chatbot-widget-container']}>
            <div className={classes['chatbot-header']}>
              <div className={classes['chatbot-title']}>
                <FaRobot size={16} />
                <span>Asistente Comercio Exterior</span>
              </div>
              <div className={classes['chatbot-controls']}>
                {onMinimize && (
                  <Button variant="link" size="sm" onClick={minimizeChat}>
                    <FaMinus size={12} />
                  </Button>
                )}
                {onExpand && (
                  <Button variant="link" size="sm" onClick={expandChat}>
                    <FaExpand size={12} />
                  </Button>
                )}
                <Button variant="link" size="sm" onClick={closeChat}>
                  <FaTimes size={12} />
                </Button>
              </div>
            </div>
            
            <div className={classes['chatbot-messages']}>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`${classes['message']} ${classes[`message-${message.role}`]}`}
                >
                  <div className={classes['message-content']}>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({node, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '')
                            return match ? (
                              <pre className="overflow-x-auto bg-light p-2 rounded text-xs">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-light px-1 py-0.5 rounded text-xs" {...props}>
                                {children}
                              </code>
                            )
                          },
                          table: ({children}) => (
                            <div className="table-responsive">
                              <table className="table table-striped table-bordered">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({children}) => (
                            <thead className="table-dark">{children}</thead>
                          ),
                          tbody: ({children}) => (
                            <tbody>{children}</tbody>
                          ),
                          tr: ({children}) => (
                            <tr>{children}</tr>
                          ),
                          th: ({children}) => (
                            <th scope="col" className="fw-bold text-center">{children}</th>
                          ),
                          td: ({children}) => {
                            // Función helper para procesar el contenido de las celdas
                            const processCellContent = (content: any): string => {
                              if (typeof content === 'string') {
                                return content;
                              }
                              if (Array.isArray(content)) {
                                return content.map(processCellContent).join('');
                              }
                              if (content && typeof content === 'object') {
                                // Si es un elemento React, extraer el texto
                                if (content.props && content.props.children) {
                                  return processCellContent(content.props.children);
                                }
                                // Si tiene propiedades de texto
                                if (content.text || content.value) {
                                  return content.text || content.value;
                                }
                              }
                              return String(content);
                            };
                            
                            const processedContent = processCellContent(children);
                            return (
                              <td className="table-cell-content">
                                {processedContent}
                              </td>
                            );
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                  <div className={classes['message-time']}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${classes['message']} ${classes['message-assistant']}`}>
                  <div className={classes['message-content']}>
                    <Spinner size="sm" animation="border" />
                    <span className="ms-2">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <Alert variant="danger" className={classes['error-alert']}>
                {error}
              </Alert>
            )}

            <div className={classes['chatbot-input']}>
              <InputGroup>
                <Form.Control
                  ref={inputRef}
                  type="text"
                  placeholder="Escribe tu consulta sobre comercio exterior..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Button 
                  variant="primary" 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  <FaPaperPlane />
                </Button>
              </InputGroup>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Button 
        variant="outline-primary" 
        className={classes['chatbot-sidebar-trigger']}
        onClick={openChat}
      >
        <FaRobot size={16} />
        <span>Asistente IA</span>
      </Button>

      <Modal 
        show={isOpen} 
        onHide={closeChat}
        size="lg"
        className={classes['chatbot-modal']}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaRobot className="me-2" />
            Asistente de Comercio Exterior
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={classes['chatbot-modal-body']}>
          <div className={classes['chatbot-messages']}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`${classes['message']} ${classes[`message-${message.role}`]}`}
              >
                <div className={classes['message-content']}>
                  {message.role === 'assistant' ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({node, className, children, ...props}) => {
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                            <pre className="overflow-x-auto bg-light p-2 rounded text-xs">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code className="bg-light px-1 py-0.5 rounded text-xs" {...props}>
                              {children}
                            </code>
                          )
                        },
                        table: ({children}) => (
                          <div className="table-responsive">
                            <table className="table table-striped table-bordered">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({children}) => (
                          <thead className="table-dark">{children}</thead>
                        ),
                        tbody: ({children}) => (
                          <tbody>{children}</tbody>
                        ),
                        tr: ({children}) => (
                          <tr>{children}</tr>
                        ),
                        th: ({children}) => (
                          <th scope="col" className="fw-bold text-center">{children}</th>
                        ),
                        td: ({children}) => {
                          // Función helper para procesar el contenido de las celdas
                          const processCellContent = (content: any): string => {
                            if (typeof content === 'string') {
                              return content;
                            }
                            if (Array.isArray(content)) {
                              return content.map(processCellContent).join('');
                            }
                            if (content && typeof content === 'object') {
                              // Si es un elemento React, extraer el texto
                              if (content.props && content.props.children) {
                                return processCellContent(content.props.children);
                              }
                              // Si tiene propiedades de texto
                              if (content.text || content.value) {
                                return content.text || content.value;
                              }
                            }
                            return String(content);
                          };
                          
                          const processedContent = processCellContent(children);
                          return (
                            <td className="table-cell-content">
                              {processedContent}
                            </td>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
                <div className={classes['message-time']}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${classes['message']} ${classes['message-assistant']}`}>
                <div className={classes['message-content']}>
                  <Spinner size="sm" animation="border" />
                  <span className="ms-2">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <Alert variant="danger" className={classes['error-alert']}>
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className={classes['chatbot-input']}>
            <InputGroup>
              <Form.Control
                ref={inputRef}
                type="text"
                placeholder="Escribe tu consulta sobre comercio exterior..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button 
                variant="primary" 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
              >
                <FaPaperPlane />
              </Button>
            </InputGroup>
          </div>
          <Button variant="outline-secondary" onClick={clearChat}>
            Limpiar Chat
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChatbotAgent;
