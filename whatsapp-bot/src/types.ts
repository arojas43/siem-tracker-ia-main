// Tipos para el bot de WhatsApp de SIEM

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: number;
  type: 'text' | 'chat' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
  isGroup: boolean;
  groupId?: string;
  senderName?: string;
  mimetype?: string;
}

export interface UserSession {
  userId: string;
  phoneNumber: string;
  lastActivity: Date;
  conversationHistory: WhatsAppMessage[];
  isActive: boolean;
  userType?: 'client' | 'siem';
  currentOperation?: string;
}

export interface BotCommand {
  command: string;
  description: string;
  handler: (message: WhatsAppMessage, client: any) => Promise<void>;
}

export interface QRCodeData {
  qr: string;
  sessionName: string;
  timestamp: Date;
}

export interface SIEMResponse {
  success: boolean;
  response: string;
  confidence: number;
  sources: string[];
  suggested_actions: string[];
  model_used: string;
  timestamp: string;
  session_id: string;
}

export interface SIEMServiceConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

export interface BotStats {
  isConnected: boolean;
  userSessions: number;
  commands: number;
  qrCodeAvailable: boolean;
  uptime: number;
  messagesProcessed: number;
}

export interface ChatbotConfig {
  siemApiUrl: string;
  siemApiToken: string;
  openaiApiKey: string;
  maxRetries: number;
  retryDelay: number;
  sessionTimeout: number;
}

export interface MessageContext {
  userType: 'client' | 'siem';
  currentPage: string;
  operationCode?: string;
  taskId?: string;
  clientId?: string;
  supplierId?: string;
  customsId?: string;
}

export interface WebhookMessage {
  phoneNumber: string;
  message: string;
  messageType?: 'text' | 'image' | 'document';
  mediaUrl?: string;
  caption?: string;
}

export interface WebhookEvent {
  type: 'operation_update' | 'task_reminder' | 'system_notification' | 'custom';
  data: {
    userId?: string;
    operationCode?: string;
    status?: string;
    taskTitle?: string;
    dueDate?: string;
    title?: string;
    message?: string;
    priority?: 'low' | 'normal' | 'high';
    [key: string]: any;
  };
  timestamp: string;
}

export interface BroadcastResult {
  phoneNumber: string;
  success: boolean;
  messageId?: string;
  error?: string;
}
