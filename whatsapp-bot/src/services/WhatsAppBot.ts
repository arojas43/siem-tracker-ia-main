import { create, Client, Message } from '@open-wa/wa-automate';
import * as QRCode from 'qrcode-terminal';
import { WhatsAppMessage, UserSession, BotCommand, QRCodeData, BotStats, MessageContext, BroadcastResult } from '../types';
import { SIEMService } from './SIEMService';
import { MonitoringService } from './MonitoringService';

export class WhatsAppBot {
  private client: Client | null = null;
  private siemService: SIEMService;
  private monitoringService: MonitoringService;
  private userSessions: Map<string, UserSession> = new Map();
  private commands: Map<string, BotCommand> = new Map();
  private isConnected = false;
  private qrCodeData: QRCodeData | null = null;
  private startTime: Date = new Date();
  private messagesProcessed = 0;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 segundos
  private isReconnecting = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(siemService: SIEMService) {
    this.siemService = siemService;
    this.monitoringService = new MonitoringService();
    this.setupCommands();
  }

  /**
   * Inicializar el bot de WhatsApp
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando bot de WhatsApp de SIEM...');
      
      // Verificar conexión con SIEM
      const isSIEMHealthy = await this.siemService.checkHealth();
      if (!isSIEMHealthy) {
        throw new Error('Servicio SIEM no está disponible');
      }

      // Crear cliente de WhatsApp
      this.client = await create({
        sessionId: 'siem-whatsapp-session',
        multiDevice: true,
        authTimeout: 60,
        blockCrashLogs: true,
        disableSpins: true,
        headless: true,
        hostNotificationLang: 'ES' as any,
        logConsole: false,
        popup: false,
        qrTimeout: 0,
        restartOnCrash: false, // Deshabilitar reinicio automático
        throwErrorOnTosBlock: false,
        useChrome: true,
        cacheEnabled: false,
        downloadMedia: true,
        mediaPath: './temp_media/',
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });

      // Configurar eventos
      this.setupEventHandlers();
      
      // Iniciar health check
      this.startHealthCheck();
      
      console.log('✅ Bot de WhatsApp de SIEM inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando bot:', error);
      await this.handleReconnection();
      throw error;
    }
  }

  /**
   * Configurar manejadores de eventos
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    console.log('🔧 Configurando manejadores de eventos de OpenWA...');

    // Evento de conexión
    this.client.onStateChanged((state) => {
      const timestamp = new Date().toISOString();
      const wasConnected = this.isConnected;
      const isNowConnected = state === 'CONNECTED';
      
      console.log(`\n📱 ===== CAMBIO DE ESTADO WHATSAPP =====`);
      console.log(`⏰ Timestamp: ${timestamp}`);
      console.log(`🔄 Estado anterior: ${wasConnected ? 'CONECTADO' : 'DESCONECTADO'}`);
      console.log(`🔄 Estado nuevo: ${state}`);
      console.log(`📊 Estado procesado: ${isNowConnected ? 'CONECTADO' : 'DESCONECTADO'}`);
      
      this.isConnected = isNowConnected;
      
      // Solo reconectar si realmente se desconectó y no estamos ya reconectando
      if (wasConnected && !isNowConnected && !this.isReconnecting && state !== 'UNPAIRED') {
        console.log('⚠️ Bot desconectado, iniciando proceso de reconexión...');
        setTimeout(() => this.handleReconnection(), 5000); // Esperar más tiempo
      }
      
      // Si se reconectó exitosamente
      if (!wasConnected && isNowConnected) {
        console.log('✅ Bot reconectado exitosamente');
        this.resetReconnectionCounters();
      }
      
      console.log(`📱 ===== FIN CAMBIO DE ESTADO =====\n`);
    });

    // Evento de QR Code
    if (typeof (this.client as any).onQR === 'function') {
      (this.client as any).onQR((qr: string) => {
        const timestamp = new Date().toISOString();
        console.log(`\n📱 ===== NUEVO CÓDIGO QR =====`);
        console.log(`⏰ Timestamp: ${timestamp}`);
        console.log(`📱 Escanea este código QR con WhatsApp:`);
        QRCode.generate(qr, { small: true });
        
        this.qrCodeData = {
          qr,
          sessionName: 'siem-whatsapp-session',
          timestamp: new Date()
        };
        console.log(`📱 ===== FIN CÓDIGO QR =====\n`);
      });
    } else {
      console.log('⚠️ Método onQR no disponible, usando método alternativo...');
      
      const checkQR = async () => {
        try {
          if (this.client) {
            const qr = await (this.client as any).getQR();
            if (qr) {
              const timestamp = new Date().toISOString();
              console.log(`\n📱 ===== CÓDIGO QR OBTENIDO =====`);
              console.log(`⏰ Timestamp: ${timestamp}`);
              console.log(`📱 Escanea este código QR con WhatsApp:`);
              QRCode.generate(qr, { small: true });
              
              this.qrCodeData = {
                qr,
                sessionName: 'siem-whatsapp-session',
                timestamp: new Date()
              };
              console.log(`📱 ===== FIN CÓDIGO QR =====\n`);
            }
          }
        } catch (error) {
          setTimeout(checkQR, 2000);
        }
      };
      
      setTimeout(checkQR, 5000);
    }

    // Evento de mensajes
    this.client.onMessage(async (message: Message) => {
      const messageTimestamp = new Date().toISOString();
      console.log(`\n📨 ===== EVENTO DE MENSAJE OPENWA =====`);
      console.log(`⏰ Timestamp: ${messageTimestamp}`);
      console.log(`🆔 Message ID: ${message.id}`);
      console.log(`📱 From: ${message.from}`);
      console.log(`📝 Body: "${message.body || ''}"`);
      console.log(`📊 Type: ${message.type}`);
      console.log(`👥 Is Group: ${message.isGroupMsg}`);
      console.log(`📨 ===== INICIANDO PROCESAMIENTO =====\n`);
      
      // Convertir mensaje a formato personalizado para logging
      const customMessage: WhatsAppMessage = {
        id: message.id,
        from: message.from,
        to: message.to,
        body: message.body || '',
        timestamp: message.timestamp,
        type: message.type as any,
        isGroup: message.isGroupMsg,
        groupId: message.chatId,
        senderName: message.sender?.name || message.sender?.pushname,
        mimetype: (message as any).mimetype
      };
      
      this.monitoringService.logMessageReceived(customMessage);
      
      try {
        const startTime = Date.now();
        await this.handleMessage(message);
        const processingTime = Date.now() - startTime;
        
        this.messagesProcessed++;
        this.monitoringService.logMessageProcessed(customMessage, { success: true }, processingTime);
      } catch (error) {
        const processingTime = Date.now() - Date.now();
        this.monitoringService.logMessageError(customMessage, error as Error, processingTime);
        console.error('❌ Error procesando mensaje:', error);
        console.error('🔍 Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      }
    });

    // Evento de llamadas entrantes
    this.client.onIncomingCall(async (call: any) => {
      const callTimestamp = new Date().toISOString();
      console.log(`\n📞 ===== LLAMADA ENTRANTE =====`);
      console.log(`⏰ Timestamp: ${callTimestamp}`);
      console.log(`📞 Datos de la llamada:`, call);
      console.log(`📞 Peer JID: ${call.peerJid}`);
      console.log(`📞 ===== RECHAZANDO LLAMADA =====\n`);
      
      try {
        await this.client?.sendText(call.peerJid, 'Lo siento, no puedo recibir llamadas. Por favor, envía un mensaje de texto.');
        console.log(`✅ Llamada rechazada y mensaje enviado`);
      } catch (error) {
        console.error(`❌ Error rechazando llamada:`, error);
      }
    });

    console.log('✅ Manejadores de eventos configurados correctamente');
  }

  /**
   * Manejar mensajes entrantes
   */
  private async handleMessage(message: Message): Promise<void> {
    if (!this.client) return;

    const startTime = Date.now();
    const messageId = message.id;
    const from = message.from;

    // Convertir mensaje a formato personalizado
    const customMessage: WhatsAppMessage = {
      id: message.id,
      from: message.from,
      to: message.to,
      body: message.body || '',
      timestamp: message.timestamp,
      type: message.type as any,
      isGroup: message.isGroupMsg,
      groupId: message.chatId,
      senderName: message.sender?.name || message.sender?.pushname,
      mimetype: (message as any).mimetype
    };

    console.log(`\n📨 ===== NUEVO MENSAJE WHATSAPP =====`);
    console.log(`🆔 ID: ${messageId}`);
    console.log(`📱 De: ${customMessage.from} (${customMessage.senderName || 'Sin nombre'})`);
    console.log(`💬 Contenido: "${customMessage.body}"`);
    console.log(`📊 Tipo: ${customMessage.type}`);
    console.log(`👥 Es grupo: ${customMessage.isGroup}`);
    console.log(`⏰ Timestamp: ${new Date(customMessage.timestamp * 1000).toISOString()}`);

    // Ignorar mensajes de grupos por ahora
    if (customMessage.isGroup) {
      console.log('⚠️ Ignorando mensaje de grupo');
      return;
    }

    // Obtener o crear sesión de usuario
    const userSession = this.getUserSession(customMessage.from);
    console.log(`👤 Sesión de usuario: ${userSession.userId}`);

    // Verificar si es un comando (tanto text como chat)
    if ((customMessage.type === 'text' || customMessage.type === 'chat') && customMessage.body) {
      if (customMessage.body.startsWith('/')) {
        console.log(`⚡ Procesando comando: ${customMessage.body.split(' ')[0]}`);
        await this.handleCommand(customMessage);
        return;
      }
    }

    // Procesar mensaje con SIEM
    console.log(`🤖 Enviando a SIEM para procesamiento...`);
    await this.processMessageWithSIEM(customMessage, userSession);
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo total de procesamiento: ${processingTime}ms`);
    console.log(`📨 ===== FIN PROCESAMIENTO MENSAJE =====\n`);
  }

  /**
   * Procesar mensaje con SIEM
   */
  private async processMessageWithSIEM(message: WhatsAppMessage, userSession: UserSession): Promise<void> {
    if (!this.client) return;

    const processingStartTime = Date.now();

    try {
      console.log(`📤 Enviando indicador de "visto" a ${message.from}`);
      await this.client.sendSeen(message.from as any);

      let response: any;

      // Procesar según el tipo de mensaje
      switch (message.type) {
        case 'text':
        case 'chat':
          console.log(`💭 Procesando mensaje de texto con SIEM...`);
          
          // Crear contexto del mensaje
          const context: MessageContext = {
            userType: userSession.userType || 'client',
            currentPage: '/whatsapp',
            operationCode: userSession.currentOperation
          };
          
          response = await this.siemService.sendMessage(
            message.body, 
            userSession.userId, 
            context
          );
          break;
        
        case 'image':
          console.log(`🖼️ Mensaje de imagen detectado`);
          response = await this.processImageMessage(message, userSession);
          break;
        
        case 'audio':
          console.log(`🎵 Mensaje de audio detectado`);
          response = await this.processAudioMessage(message, userSession);
          break;
        
        case 'video':
          console.log(`🎥 Mensaje de video detectado`);
          response = await this.processVideoMessage(message, userSession);
          break;
        
        case 'document':
          console.log(`📄 Mensaje de documento detectado`);
          response = await this.processDocumentMessage(message, userSession);
          break;
        
        default:
          console.log(`❓ Tipo de mensaje no soportado: ${message.type}`);
          if (message.body && message.body.trim()) {
            console.log(`🔄 Intentando procesar como texto: "${message.body.substring(0, 50)}..."`);
            response = await this.siemService.sendMessage(message.body, userSession.userId);
          } else {
            console.log(`⚠️ Mensaje ignorado - Tipo no soportado: ${message.type}`);
            return;
          }
      }

      const processingTime = Date.now() - processingStartTime;
      console.log(`⏱️ Tiempo de procesamiento SIEM: ${processingTime}ms`);

      // Enviar respuesta
      if (response.success) {
        console.log(`✅ Respuesta exitosa de SIEM:`);
        console.log(`📝 Texto: "${response.response.substring(0, 100)}${response.response.length > 100 ? '...' : ''}"`);
        console.log(`🤖 Modelo: ${response.model_used || 'N/A'}`);
        console.log(`🎯 Confianza: ${response.confidence || 'N/A'}`);
        
        // Enviar respuesta
        console.log(`📤 Enviando respuesta a WhatsApp...`);
        await this.client.sendText(message.from as any, response.response);
        console.log(`✅ Respuesta enviada exitosamente a ${message.from}`);
      } else {
        console.log(`❌ Error en respuesta de SIEM:`);
        console.log(`📝 Mensaje de error: "${response.response}"`);
        
        console.log(`📤 Enviando mensaje de error a WhatsApp...`);
        await this.client.sendText(message.from as any, response.response);
        console.log(`⚠️ Mensaje de error enviado a ${message.from}`);
      }

      // Actualizar sesión de usuario
      this.updateUserSession(userSession, message);
      console.log(`👤 Sesión de usuario actualizada`);

    } catch (error) {
      const errorTime = Date.now() - processingStartTime;
      console.error(`❌ Error procesando mensaje con SIEM (${errorTime}ms):`, error);
      console.error(`🔍 Stack trace:`, error instanceof Error ? error.stack : 'No stack trace available');
      
      try {
        await this.client.sendText(message.from as any, 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo.');
        console.log(`📤 Mensaje de error enviado a WhatsApp`);
      } catch (sendError) {
        console.error(`❌ Error enviando mensaje de error a WhatsApp:`, sendError);
      }
    }
  }

  /**
   * Manejar comandos
   */
  private async handleCommand(message: WhatsAppMessage): Promise<void> {
    if (!this.client) return;

    const command = message.body?.split(' ')[0]?.toLowerCase() || '';
    const commandHandler = this.commands.get(command);

    if (commandHandler) {
      this.monitoringService.logCommandExecuted(command, message.from, true);
      await commandHandler.handler(message, this.client);
    } else {
      this.monitoringService.logCommandExecuted(command, message.from, false);
      await this.client?.sendText(message.from as any, 'Comando no reconocido. Usa /help para ver los comandos disponibles.');
    }
  }

  /**
   * Configurar comandos del bot
   */
  private setupCommands(): void {
    this.commands.set('/help', {
      command: '/help',
      description: 'Mostrar ayuda',
      handler: async (message, client) => {
        const helpText = `🤖 *SIEM WhatsApp Bot - Comercio Exterior*

*Comandos disponibles:*
/help - Mostrar esta ayuda
/status - Estado del bot
/operaciones - Ver mis operaciones
/tareas - Ver mis tareas
/clientes - Ver clientes
/proveedores - Ver proveedores
/aduanas - Ver aduanas
/analizar <código> - Analizar operación específica
/reporte <tipo> - Generar reporte
/clear - Limpiar historial de conversación
/info - Información sobre SIEM

*Funcionalidades:*
• Consultas sobre operaciones de comercio exterior
• Análisis de datos de importación/exportación
• Información sobre regulaciones aduaneras
• Estado de tareas y procesos logísticos
• Consultas sobre clientes, proveedores y aduanas
• Respuestas inteligentes y contextuales

*Tipos de consulta soportados:*
• Texto - Chat conversacional especializado
• Comandos - Acceso rápido a funciones específicas

¡Envía cualquier mensaje para comenzar!`;
        
        await client.sendText(message.from as any, helpText);
      }
    });

    this.commands.set('/status', {
      command: '/status',
      description: 'Estado del bot',
      handler: async (message, client) => {
        const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
        const statusText = `📊 *Estado del Bot SIEM*

• Bot: ${this.isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
• SIEM: ${await this.siemService.checkHealth() ? '🟢 Disponible' : '🔴 No disponible'}
• Sesiones activas: ${this.userSessions.size}
• Comandos: ${this.commands.size}
• Mensajes procesados: ${this.messagesProcessed}
• Tiempo activo: ${Math.floor(uptime / 60)}m ${uptime % 60}s`;
        
        await client.sendText(message.from as any, statusText);
      }
    });

    this.commands.set('/operaciones', {
      command: '/operaciones',
      description: 'Ver operaciones',
      handler: async (message, client) => {
        const userSession = this.getUserSession(message.from);
        const context: MessageContext = {
          userType: userSession.userType || 'client',
          currentPage: '/operations'
        };
        
        const response = await this.siemService.sendMessage(
          'Muestra mis operaciones más recientes con su estado actual',
          userSession.userId,
          context
        );
        
        await client.sendText(message.from as any, response.response);
      }
    });

    this.commands.set('/tareas', {
      command: '/tareas',
      description: 'Ver tareas',
      handler: async (message, client) => {
        const userSession = this.getUserSession(message.from);
        const context: MessageContext = {
          userType: userSession.userType || 'client',
          currentPage: '/tasks'
        };
        
        const response = await this.siemService.sendMessage(
          'Muestra mis tareas pendientes y su estado',
          userSession.userId,
          context
        );
        
        await client.sendText(message.from as any, response.response);
      }
    });

    this.commands.set('/analizar', {
      command: '/analizar',
      description: 'Analizar operación',
      handler: async (message, client) => {
        const operationCode = message.body.replace('/analizar ', '').trim();
        if (!operationCode) {
          await client.sendText(message.from as any, 'Por favor, proporciona el código de operación.\nEjemplo: /analizar SOD25-058');
          return;
        }

        const userSession = this.getUserSession(message.from);
        const response = await this.siemService.analyzeOperation(operationCode, userSession.userId);
        
        await client.sendText(message.from as any, response.response);
      }
    });

    this.commands.set('/clear', {
      command: '/clear',
      description: 'Limpiar historial',
      handler: async (message, client) => {
        const userSession = this.getUserSession(message.from);
        userSession.conversationHistory = [];
        this.userSessions.set(message.from, userSession);
        await client.sendText(message.from as any, '✅ Historial de conversación limpiado.');
      }
    });

    this.commands.set('/info', {
      command: '/info',
      description: 'Información sobre SIEM',
      handler: async (message, client) => {
        const infoText = `🤖 *SIEM - Sistema de Importación y Exportación de México*

*Características:*
• Gestión de operaciones de comercio exterior
• Seguimiento de procesos aduaneros
• Análisis de datos logísticos
• Consultas especializadas en regulaciones

*Desarrollado por:* SIEM Team
*Versión:* 1.0.0
*Soporte:* WhatsApp Bot

¡Estoy aquí para ayudarte con tus consultas de comercio exterior!`;
        
        await client.sendText(message.from as any, infoText);
      }
    });
  }

  /**
   * Obtener sesión de usuario
   */
  private getUserSession(phoneNumber: string): UserSession {
    let session = this.userSessions.get(phoneNumber);
    
    if (!session) {
      session = {
        userId: `whatsapp_${phoneNumber.replace('@c.us', '')}`,
        phoneNumber,
        lastActivity: new Date(),
        conversationHistory: [],
        isActive: true,
        userType: 'client' // Por defecto, se puede cambiar según configuración
      };
      this.userSessions.set(phoneNumber, session);
      this.monitoringService.logUserSession(session, 'created');
    }
    
    return session;
  }

  /**
   * Actualizar sesión de usuario
   */
  private updateUserSession(session: UserSession, message: WhatsAppMessage): void {
    session.lastActivity = new Date();
    session.conversationHistory.push(message);
    
    // Mantener solo los últimos 50 mensajes
    if (session.conversationHistory.length > 50) {
      session.conversationHistory = session.conversationHistory.slice(-50);
    }
    
    this.userSessions.set(message.from, session);
    this.monitoringService.logUserSession(session, 'updated');
  }

  /**
   * Obtener datos del QR Code
   */
  getQRCodeData(): QRCodeData | null {
    return this.qrCodeData;
  }

  /**
   * Obtener estadísticas del bot
   */
  getStats(): BotStats {
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    
    return {
      isConnected: this.isConnected,
      userSessions: this.userSessions.size,
      commands: this.commands.size,
      qrCodeAvailable: this.qrCodeData !== null,
      uptime: uptime,
      messagesProcessed: this.messagesProcessed
    };
  }

  /**
   * Iniciar health check periódico
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        // Solo verificar SIEM cada 2 minutos, no reconectar automáticamente
        const isSIEMHealthy = await this.siemService.checkHealth();
        if (!isSIEMHealthy) {
          console.warn('⚠️ Health check: Servicio SIEM no disponible');
        }
        
        // Solo reconectar si realmente está desconectado y no estamos ya reconectando
        if (!this.isConnected && !this.isReconnecting && this.client === null) {
          console.log('🔍 Health check: Bot realmente desconectado, intentando reconexión...');
          await this.handleReconnection();
        }
      } catch (error) {
        console.error('❌ Error en health check:', error);
      }
    }, 120000); // Cada 2 minutos en lugar de 30 segundos
  }

  /**
   * Manejar reconexión automática
   */
  private async handleReconnection(): Promise<void> {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Máximo número de intentos de reconexión alcanzado');
        return;
      }
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`🔄 Intentando reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

    try {
      // Cerrar conexión actual si existe
      if (this.client) {
        await this.close();
      }

      // Esperar antes de reconectar
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));

      // Intentar reconectar
      await this.initialize();
      
      console.log('✅ Reconexión exitosa');
      this.monitoringService.logReconnection(this.reconnectAttempts, true);
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
    } catch (error) {
      console.error(`❌ Error en reconexión ${this.reconnectAttempts}:`, error);
      this.monitoringService.logReconnection(this.reconnectAttempts, false, error as Error);
      this.isReconnecting = false;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        // Aumentar delay exponencialmente
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 60000);
        setTimeout(() => this.handleReconnection(), this.reconnectDelay);
      }
    }
  }

  /**
   * Resetear contadores de reconexión
   */
  private resetReconnectionCounters(): void {
    this.reconnectAttempts = 0;
    this.reconnectDelay = 5000;
    this.isReconnecting = false;
  }

  /**
   * Procesar mensaje de imagen
   */
  private async processImageMessage(message: WhatsAppMessage, userSession: UserSession): Promise<any> {
    try {
      console.log(`🖼️ Procesando imagen de ${message.from}`);
      
      // Por ahora, enviar mensaje genérico sobre imágenes
      // En el futuro se podría integrar con OCR o análisis de imágenes
      const response = {
        success: true,
        response: `🖼️ He recibido tu imagen. Por el momento, no puedo analizar imágenes automáticamente, pero puedes describir lo que necesitas y te ayudo con información sobre comercio exterior.`,
        confidence: 0.8,
        sources: ['WhatsApp Bot'],
        suggested_actions: ['Describir la imagen', 'Hacer consulta específica'],
        model_used: 'whatsapp-image-handler',
        timestamp: new Date().toISOString(),
        session_id: `image_${Date.now()}`
      };
      
      return response;
    } catch (error) {
      console.error('❌ Error procesando imagen:', error);
      return {
        success: false,
        response: 'Lo siento, no pude procesar tu imagen. Por favor, inténtalo de nuevo o envía un mensaje de texto.',
        confidence: 0,
        sources: [],
        suggested_actions: [],
        model_used: 'error',
        timestamp: new Date().toISOString(),
        session_id: `error_${Date.now()}`
      };
    }
  }

  /**
   * Procesar mensaje de audio
   */
  private async processAudioMessage(message: WhatsAppMessage, userSession: UserSession): Promise<any> {
    try {
      console.log(`🎵 Procesando audio de ${message.from}`);
      
      const response = {
        success: true,
        response: `🎵 He recibido tu mensaje de audio. Por el momento, no puedo procesar audio automáticamente. Por favor, envía un mensaje de texto con tu consulta sobre comercio exterior.`,
        confidence: 0.8,
        sources: ['WhatsApp Bot'],
        suggested_actions: ['Enviar mensaje de texto', 'Hacer consulta específica'],
        model_used: 'whatsapp-audio-handler',
        timestamp: new Date().toISOString(),
        session_id: `audio_${Date.now()}`
      };
      
      return response;
    } catch (error) {
      console.error('❌ Error procesando audio:', error);
      return {
        success: false,
        response: 'Lo siento, no pude procesar tu audio. Por favor, envía un mensaje de texto.',
        confidence: 0,
        sources: [],
        suggested_actions: [],
        model_used: 'error',
        timestamp: new Date().toISOString(),
        session_id: `error_${Date.now()}`
      };
    }
  }

  /**
   * Procesar mensaje de video
   */
  private async processVideoMessage(message: WhatsAppMessage, userSession: UserSession): Promise<any> {
    try {
      console.log(`🎥 Procesando video de ${message.from}`);
      
      const response = {
        success: true,
        response: `🎥 He recibido tu video. Por el momento, no puedo procesar videos automáticamente. Por favor, envía un mensaje de texto con tu consulta sobre comercio exterior.`,
        confidence: 0.8,
        sources: ['WhatsApp Bot'],
        suggested_actions: ['Enviar mensaje de texto', 'Hacer consulta específica'],
        model_used: 'whatsapp-video-handler',
        timestamp: new Date().toISOString(),
        session_id: `video_${Date.now()}`
      };
      
      return response;
    } catch (error) {
      console.error('❌ Error procesando video:', error);
      return {
        success: false,
        response: 'Lo siento, no pude procesar tu video. Por favor, envía un mensaje de texto.',
        confidence: 0,
        sources: [],
        suggested_actions: [],
        model_used: 'error',
        timestamp: new Date().toISOString(),
        session_id: `error_${Date.now()}`
      };
    }
  }

  /**
   * Procesar mensaje de documento
   */
  private async processDocumentMessage(message: WhatsAppMessage, userSession: UserSession): Promise<any> {
    try {
      console.log(`📄 Procesando documento de ${message.from}`);
      
      // Obtener información del documento
      const mimetype = message.mimetype || 'unknown';
      const isPDF = mimetype.includes('pdf');
      const isExcel = mimetype.includes('excel') || mimetype.includes('spreadsheet');
      const isWord = mimetype.includes('word') || mimetype.includes('document');
      
      let responseText = `📄 He recibido tu documento (${mimetype}). `;
      
      if (isPDF) {
        responseText += `Es un archivo PDF. Por el momento, no puedo analizar documentos PDF automáticamente, pero puedes describir el contenido y te ayudo con información sobre comercio exterior.`;
      } else if (isExcel) {
        responseText += `Es un archivo de Excel. Por el momento, no puedo analizar hojas de cálculo automáticamente, pero puedes describir los datos y te ayudo con análisis de comercio exterior.`;
      } else if (isWord) {
        responseText += `Es un documento de Word. Por el momento, no puedo analizar documentos automáticamente, pero puedes describir el contenido y te ayudo con información sobre comercio exterior.`;
      } else {
        responseText += `Por el momento, no puedo analizar este tipo de documento automáticamente, pero puedes describir el contenido y te ayudo con información sobre comercio exterior.`;
      }
      
      const response = {
        success: true,
        response: responseText,
        confidence: 0.8,
        sources: ['WhatsApp Bot'],
        suggested_actions: ['Describir el documento', 'Hacer consulta específica', 'Enviar mensaje de texto'],
        model_used: 'whatsapp-document-handler',
        timestamp: new Date().toISOString(),
        session_id: `document_${Date.now()}`
      };
      
      return response;
    } catch (error) {
      console.error('❌ Error procesando documento:', error);
      return {
        success: false,
        response: 'Lo siento, no pude procesar tu documento. Por favor, envía un mensaje de texto.',
        confidence: 0,
        sources: [],
        suggested_actions: [],
        model_used: 'error',
        timestamp: new Date().toISOString(),
        session_id: `error_${Date.now()}`
      };
    }
  }

  /**
   * Enviar mensaje a un número específico
   */
  async sendMessage(phoneNumber: string, message: string, messageType: 'text' | 'image' | 'document' = 'text'): Promise<{ messageId: string; success: boolean }> {
    if (!this.client || !this.isConnected) {
      throw new Error('Bot no está conectado');
    }

    try {
      console.log(`📤 Enviando mensaje a ${phoneNumber}: ${message.substring(0, 50)}...`);
      
      let messageId: string;
      
      switch (messageType) {
        case 'text':
          const textResult = await this.client.sendText(phoneNumber as any, message);
          messageId = typeof textResult === 'string' ? textResult : textResult.toString();
          break;
        case 'image':
          // Para imágenes, necesitarías la URL o path del archivo
          throw new Error('Envío de imágenes no implementado aún');
        case 'document':
          // Para documentos, necesitarías la URL o path del archivo
          throw new Error('Envío de documentos no implementado aún');
        default:
          const defaultResult = await this.client.sendText(phoneNumber as any, message);
          messageId = typeof defaultResult === 'string' ? defaultResult : defaultResult.toString();
      }

      console.log(`✅ Mensaje enviado exitosamente. ID: ${messageId}`);
      return { messageId, success: true };
    } catch (error) {
      console.error(`❌ Error enviando mensaje a ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Enviar mensaje a múltiples números (broadcast)
   */
  async broadcastMessage(phoneNumbers: string[], message: string, messageType: 'text' | 'image' | 'document' = 'text'): Promise<BroadcastResult[]> {
    const results: BroadcastResult[] = [];
    
    console.log(`📢 Iniciando broadcast a ${phoneNumbers.length} números...`);
    
    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await this.sendMessage(phoneNumber, message, messageType);
        results.push({
          phoneNumber,
          success: true,
          messageId: result.messageId
        });
        
        // Pequeña pausa entre mensajes para evitar spam
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error en broadcast para ${phoneNumber}:`, error);
        results.push({
          phoneNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Broadcast completado: ${successCount}/${phoneNumbers.length} exitosos`);
    
    return results;
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  getPerformanceStats(): any {
    return this.monitoringService.getPerformanceStats();
  }

  /**
   * Generar reporte de salud
   */
  generateHealthReport(): any {
    return this.monitoringService.generateHealthReport();
  }

  /**
   * Obtener logger para uso externo
   */
  getLogger(): any {
    return this.monitoringService.getLogger();
  }

  /**
   * Cerrar conexión
   */
  async close(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.client) {
      try {
        // Verificar si el método close existe antes de llamarlo
        if (typeof (this.client as any).close === 'function') {
          await (this.client as any).close();
        } else if (typeof (this.client as any).kill === 'function') {
          await (this.client as any).kill();
        } else {
          console.log('⚠️ No se encontró método de cierre para el cliente');
        }
      } catch (error) {
        console.error('Error cerrando cliente:', error);
      }
      this.client = null;
    }
    this.isConnected = false;
    this.resetReconnectionCounters();
  }
}
