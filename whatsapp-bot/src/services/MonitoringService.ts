import winston from 'winston';
import { BotStats, WhatsAppMessage, UserSession } from '../types';

export class MonitoringService {
  private logger!: winston.Logger;
  private metrics: Map<string, any> = new Map();
  private startTime: Date = new Date();

  constructor() {
    this.setupLogger();
    this.initializeMetrics();
  }

  /**
   * Configurar logger de Winston
   */
  private setupLogger(): void {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'siem-whatsapp-bot' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // File transport para errores
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        // File transport para todos los logs
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });
  }

  /**
   * Inicializar métricas
   */
  private initializeMetrics(): void {
    this.metrics.set('messages_processed', 0);
    this.metrics.set('messages_successful', 0);
    this.metrics.set('messages_failed', 0);
    this.metrics.set('commands_executed', 0);
    this.metrics.set('errors_count', 0);
    this.metrics.set('reconnections_count', 0);
    this.metrics.set('active_sessions', 0);
    this.metrics.set('uptime_seconds', 0);
  }

  /**
   * Log de mensaje recibido
   */
  logMessageReceived(message: WhatsAppMessage): void {
    this.incrementMetric('messages_processed');
    
    this.logger.info('Mensaje recibido', {
      messageId: message.id,
      from: message.from,
      type: message.type,
      isGroup: message.isGroup,
      timestamp: new Date(message.timestamp * 1000).toISOString(),
      bodyLength: message.body?.length || 0
    });
  }

  /**
   * Log de mensaje procesado exitosamente
   */
  logMessageProcessed(message: WhatsAppMessage, response: any, processingTime: number): void {
    this.incrementMetric('messages_successful');
    
    this.logger.info('Mensaje procesado exitosamente', {
      messageId: message.id,
      from: message.from,
      processingTimeMs: processingTime,
      responseLength: response.response?.length || 0,
      confidence: response.confidence,
      modelUsed: response.model_used
    });
  }

  /**
   * Log de error en procesamiento
   */
  logMessageError(message: WhatsAppMessage, error: Error, processingTime: number): void {
    this.incrementMetric('messages_failed');
    this.incrementMetric('errors_count');
    
    this.logger.error('Error procesando mensaje', {
      messageId: message.id,
      from: message.from,
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime
    });
  }

  /**
   * Log de comando ejecutado
   */
  logCommandExecuted(command: string, from: string, success: boolean): void {
    this.incrementMetric('commands_executed');
    
    this.logger.info('Comando ejecutado', {
      command,
      from,
      success,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de reconexión
   */
  logReconnection(attempt: number, success: boolean, error?: Error): void {
    this.incrementMetric('reconnections_count');
    
    if (success) {
      this.logger.info('Reconexión exitosa', {
        attempt,
        timestamp: new Date().toISOString()
      });
    } else {
      this.logger.error('Error en reconexión', {
        attempt,
        error: error?.message,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log de sesión de usuario
   */
  logUserSession(session: UserSession, action: 'created' | 'updated' | 'expired'): void {
    this.logger.info('Sesión de usuario', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
      action,
      lastActivity: session.lastActivity.toISOString(),
      conversationLength: session.conversationHistory.length,
      userType: session.userType
    });
  }

  /**
   * Log de webhook recibido
   */
  logWebhookReceived(endpoint: string, data: any, success: boolean): void {
    this.logger.info('Webhook recibido', {
      endpoint,
      success,
      dataSize: JSON.stringify(data).length,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de health check
   */
  logHealthCheck(stats: BotStats, siemHealthy: boolean): void {
    this.logger.info('Health check', {
      botConnected: stats.isConnected,
      activeSessions: stats.userSessions,
      messagesProcessed: stats.messagesProcessed,
      uptime: stats.uptime,
      siemHealthy,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Incrementar métrica
   */
  private incrementMetric(key: string, value: number = 1): void {
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + value);
  }

  /**
   * Obtener métricas actuales
   */
  getMetrics(): Map<string, any> {
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    this.metrics.set('uptime_seconds', uptime);
    
    return new Map(this.metrics);
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  getPerformanceStats(): any {
    const metrics = this.getMetrics();
    const messagesProcessed = metrics.get('messages_processed') || 0;
    const messagesSuccessful = metrics.get('messages_successful') || 0;
    const messagesFailed = metrics.get('messages_failed') || 0;
    const uptime = metrics.get('uptime_seconds') || 0;

    return {
      uptime: uptime,
      uptimeFormatted: this.formatUptime(uptime),
      messagesProcessed,
      messagesSuccessful,
      messagesFailed,
      successRate: messagesProcessed > 0 ? (messagesSuccessful / messagesProcessed * 100).toFixed(2) : 0,
      errorRate: messagesProcessed > 0 ? (messagesFailed / messagesProcessed * 100).toFixed(2) : 0,
      messagesPerMinute: uptime > 0 ? (messagesProcessed / (uptime / 60)).toFixed(2) : 0,
      commandsExecuted: metrics.get('commands_executed') || 0,
      reconnectionsCount: metrics.get('reconnections_count') || 0,
      errorsCount: metrics.get('errors_count') || 0
    };
  }

  /**
   * Formatear tiempo de actividad
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Generar reporte de salud
   */
  generateHealthReport(): any {
    const stats = this.getPerformanceStats();
    const metrics = this.getMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      status: stats.errorRate > 10 ? 'warning' : 'healthy',
      uptime: stats.uptimeFormatted,
      performance: {
        messagesProcessed: stats.messagesProcessed,
        successRate: `${stats.successRate}%`,
        errorRate: `${stats.errorRate}%`,
        messagesPerMinute: stats.messagesPerMinute
      },
      system: {
        commandsExecuted: stats.commandsExecuted,
        reconnectionsCount: stats.reconnectionsCount,
        errorsCount: stats.errorsCount,
        activeSessions: metrics.get('active_sessions') || 0
      },
      recommendations: this.generateRecommendations(stats)
    };
  }

  /**
   * Generar recomendaciones basadas en métricas
   */
  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = [];

    if (stats.errorRate > 10) {
      recommendations.push('Alta tasa de errores detectada. Revisar logs para identificar problemas.');
    }

    if (stats.reconnectionsCount > 5) {
      recommendations.push('Múltiples reconexiones detectadas. Verificar estabilidad de la conexión.');
    }

    if (stats.messagesPerMinute > 100) {
      recommendations.push('Alto volumen de mensajes. Considerar escalar recursos si es necesario.');
    }

    if (stats.successRate < 90) {
      recommendations.push('Tasa de éxito baja. Revisar configuración del bot y servicios externos.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Sistema funcionando correctamente.');
    }

    return recommendations;
  }

  /**
   * Limpiar logs antiguos (llamar periódicamente)
   */
  cleanOldLogs(): void {
    // Winston maneja la rotación automáticamente con maxFiles
    this.logger.info('Limpieza de logs completada');
  }

  /**
   * Obtener logger para uso externo
   */
  getLogger(): winston.Logger {
    return this.logger;
  }
}
