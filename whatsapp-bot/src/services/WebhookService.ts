import express, { Request, Response } from 'express';
import { WhatsAppBot } from './WhatsAppBot';
import { WebhookMessage, WebhookEvent } from '../types';

export class WebhookService {
  private app: express.Application;
  private whatsappBot: WhatsAppBot;
  private port: number;

  constructor(whatsappBot: WhatsAppBot, port: number = 3002) {
    this.whatsappBot = whatsappBot;
    this.port = port;
    this.app = express();
    this.setupRoutes();
  }

  /**
   * Configurar rutas del webhook
   */
  private setupRoutes(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Middleware de logging
    this.app.use((req, res, next) => {
      console.log(`📡 Webhook: ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });

    // Endpoint para enviar mensajes
    this.app.post('/webhook/send-message', async (req: Request, res: Response) => {
      try {
        const { phoneNumber, message, messageType = 'text' } = req.body;

        if (!phoneNumber || !message) {
          res.status(400).json({
            success: false,
            error: 'phoneNumber y message son requeridos'
          });
          return;
        }

        const result = await this.whatsappBot.sendMessage(phoneNumber, message, messageType);
        
        res.json({
          success: true,
          messageId: result.messageId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error enviando mensaje via webhook:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    });

    // Endpoint para enviar mensajes a múltiples usuarios
    this.app.post('/webhook/broadcast', async (req: Request, res: Response) => {
      try {
        const { phoneNumbers, message, messageType = 'text' } = req.body;

        if (!phoneNumbers || !Array.isArray(phoneNumbers) || !message) {
          res.status(400).json({
            success: false,
            error: 'phoneNumbers (array) y message son requeridos'
          });
          return;
        }

        const results = await this.whatsappBot.broadcastMessage(phoneNumbers, message, messageType);
        
        res.json({
          success: true,
          results,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error enviando broadcast via webhook:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    });

    // Endpoint para obtener estado del bot
    this.app.get('/webhook/status', (req: Request, res: Response) => {
      const stats = this.whatsappBot.getStats();
      res.json({
        success: true,
        bot: stats,
        timestamp: new Date().toISOString()
      });
    });

    // Endpoint para obtener QR code
    this.app.get('/webhook/qr', (req: Request, res: Response) => {
      const qrData = this.whatsappBot.getQRCodeData();
      if (qrData) {
        res.json({
          success: true,
          qr: qrData.qr,
          sessionName: qrData.sessionName,
          timestamp: qrData.timestamp
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'QR Code no disponible'
        });
      }
    });

    // Endpoint para reiniciar bot
    this.app.post('/webhook/restart', async (req: Request, res: Response) => {
      try {
        await this.whatsappBot.close();
        await this.whatsappBot.initialize();
        
        res.json({
          success: true,
          message: 'Bot reiniciado exitosamente',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error reiniciando bot via webhook:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    });

    // Endpoint para recibir eventos del backend
    this.app.post('/webhook/event', async (req: Request, res: Response) => {
      try {
        const event: WebhookEvent = req.body;
        
        console.log(`📨 Evento recibido del backend:`, event);
        
        // Procesar evento según el tipo
        switch (event.type) {
          case 'operation_update':
            await this.handleOperationUpdate(event);
            break;
          case 'task_reminder':
            await this.handleTaskReminder(event);
            break;
          case 'system_notification':
            await this.handleSystemNotification(event);
            break;
          default:
            console.log(`⚠️ Tipo de evento no reconocido: ${event.type}`);
        }
        
        res.json({
          success: true,
          message: 'Evento procesado exitosamente',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error procesando evento:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    });

    // Health check
    this.app.get('/webhook/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        service: 'whatsapp-webhook',
        timestamp: new Date().toISOString()
      });
    });

    // Manejo de errores
    this.app.use((error: any, req: Request, res: Response, next: any) => {
      console.error('❌ Error en webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    });
  }

  /**
   * Manejar actualización de operación
   */
  private async handleOperationUpdate(event: WebhookEvent): Promise<void> {
    const { operationCode, status, userId } = event.data;
    
    if (userId) {
      const message = `📋 *Actualización de Operación*\n\n` +
        `Código: ${operationCode}\n` +
        `Estado: ${status}\n` +
        `Fecha: ${new Date().toLocaleString('es-MX')}\n\n` +
        `Usa /analizar ${operationCode} para más detalles.`;
      
      await this.whatsappBot.sendMessage(userId, message);
    }
  }

  /**
   * Manejar recordatorio de tarea
   */
  private async handleTaskReminder(event: WebhookEvent): Promise<void> {
    const { taskTitle, dueDate, userId } = event.data;
    
    if (userId) {
      const message = `⏰ *Recordatorio de Tarea*\n\n` +
        `Tarea: ${taskTitle}\n` +
        `Vencimiento: ${dueDate ? new Date(dueDate).toLocaleString('es-MX') : 'No especificado'}\n\n` +
        `Usa /tareas para ver todas tus tareas pendientes.`;
      
      await this.whatsappBot.sendMessage(userId, message);
    }
  }

  /**
   * Manejar notificación del sistema
   */
  private async handleSystemNotification(event: WebhookEvent): Promise<void> {
    const { title, message, userId, priority = 'normal' } = event.data;
    
    if (userId) {
      const priorityEmoji = priority === 'high' ? '🚨' : priority === 'normal' ? '⚠️' : 'ℹ️';
      const formattedMessage = `${priorityEmoji} *${title}*\n\n${message}`;
      
      await this.whatsappBot.sendMessage(userId, formattedMessage);
    }
  }

  /**
   * Iniciar servidor webhook
   */
  start(): void {
    this.app.listen(this.port, () => {
      console.log(`🌐 Servidor webhook iniciado en puerto ${this.port}`);
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   POST /webhook/send-message - Enviar mensaje`);
      console.log(`   POST /webhook/broadcast - Enviar mensaje a múltiples usuarios`);
      console.log(`   POST /webhook/event - Recibir eventos del backend`);
      console.log(`   GET  /webhook/status - Estado del bot`);
      console.log(`   GET  /webhook/qr - Código QR`);
      console.log(`   POST /webhook/restart - Reiniciar bot`);
      console.log(`   GET  /webhook/health - Health check`);
    });
  }

  /**
   * Detener servidor webhook
   */
  stop(): void {
    // El servidor se detendrá automáticamente cuando se cierre el proceso
    console.log('🛑 Servidor webhook detenido');
  }
}
