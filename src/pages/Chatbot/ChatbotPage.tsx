import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaRobot, FaPaperPlane, FaUser, FaRobot as FaBot } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import classes from './ChatbotPage.module.scss';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages, isLoading]);

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
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          user_id: 'carlos.martinez@siem.business',
          context: {
            user_type: 'siem',
            current_page: '/chatbot'
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
      
      // Scroll adicional después de agregar el mensaje del asistente
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 100);
    } catch (err) {
      setError('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
      console.error('Error:', err);
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

  return (
    <div className={classes['chatbot-page']}>
      <div className={classes['messages-container']}>
        {messages.length === 0 ? (
          <div className={classes['welcome-message']}>
            <FaRobot className={classes['welcome-icon']} />
            <h3>¡Hola! Soy tu asistente de comercio exterior</h3>
            <p>Puedo ayudarte con:</p>
            <ul>
              <li>Consultas sobre operaciones de importación y exportación</li>
              <li>Estado de tareas y procesos</li>
              <li>Información de clientes y proveedores</li>
              <li>Regulaciones aduaneras y documentación</li>
              <li>Análisis de datos operacionales</li>
            </ul>
            <p>¿En qué puedo ayudarte hoy?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${classes['message']} ${
                message.role === 'user' ? classes['user-message'] : classes['assistant-message']
              }`}
            >
              <div className={classes['message-content']}>
                <div className={classes['message-header']}>
                  {message.role === 'user' ? (
                    <FaUser className={classes['message-icon']} />
                  ) : (
                    <FaBot className={classes['message-icon']} />
                  )}
                  <span className={classes['message-role']}>
                    {message.role === 'user' ? 'Tú' : 'Asistente IA'}
                  </span>
                  <span className={classes['message-time']}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className={classes['message-text']}>
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
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className={`${classes['message']} ${classes['assistant-message']}`}>
            <div className={classes['message-content']}>
              <div className={classes['message-header']}>
                <FaBot className={classes['message-icon']} />
                <span className={classes['message-role']}>Asistente IA</span>
              </div>
              <div className={classes['message-text']}>
                <Spinner animation="border" size="sm" className="me-2" />
                Procesando tu consulta...
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="danger" className={classes['error-alert']}>
            {error}
          </Alert>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className={classes['input-container']}>
        <Form.Control
          ref={inputRef}
          type="text"
          placeholder="Escribe tu consulta sobre comercio exterior..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className={classes['message-input']}
        />
        <Button
          variant="primary"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className={classes['send-button']}
        >
          <FaPaperPlane />
        </Button>
      </div>
    </div>
  );
};

export default ChatbotPage;