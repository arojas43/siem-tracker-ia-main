import axios, { AxiosInstance } from 'axios';
import { SIEMResponse, SIEMServiceConfig, MessageContext } from '../types';

export class SIEMService {
  private client: AxiosInstance;
  private config: SIEMServiceConfig;

  constructor(config: SIEMServiceConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && config.apiKey.trim() !== '' && { 'Authorization': `Bearer ${config.apiKey}` })
      }
    });
  }

  /**
   * Enviar mensaje al chatbot de SIEM
   */
  async sendMessage(
    message: string, 
    userId: string, 
    context?: MessageContext
  ): Promise<SIEMResponse> {
    try {
      console.log(`🤖 Enviando mensaje a SIEM: "${message}"`);
      console.log(`📡 URL: ${this.config.baseUrl}/api/chatbot/chat`);
      console.log(`🔑 User ID: ${userId}`);
      
      const response = await this.client.post('/api/chatbot/chat', {
        message: message,
        user_id: userId,
        context: context || {
          user_type: 'client',
          current_page: '/whatsapp'
        },
        session_id: `whatsapp_${userId}_${Date.now()}`
      });

      console.log(`✅ Respuesta recibida de SIEM:`, response.data);

      return {
        success: true,
        response: response.data.response,
        confidence: response.data.confidence,
        sources: response.data.sources || [],
        suggested_actions: response.data.suggested_actions || [],
        model_used: response.data.model_used || 'siem-chatbot',
        timestamp: response.data.timestamp,
        session_id: response.data.session_id
      };
    } catch (error: any) {
      console.error('❌ Error enviando mensaje a SIEM:', error.message);
      console.error('❌ Detalles del error:', error.response?.data || error);
      
      return {
        success: false,
        response: 'Lo siento, no pude procesar tu mensaje en este momento. Por favor, inténtalo de nuevo.',
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
   * Obtener sugerencias de consultas
   */
  async getSuggestions(): Promise<string[]> {
    try {
      const response = await this.client.get('/api/chatbot/suggestions');
      
      if (response.data && response.data.suggestions) {
        const suggestions: string[] = [];
        response.data.suggestions.forEach((category: any) => {
          suggestions.push(...category.queries);
        });
        return suggestions;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo sugerencias:', error);
      return [];
    }
  }

  /**
   * Analizar operación específica
   */
  async analyzeOperation(operationCode: string, userId: string): Promise<SIEMResponse> {
    try {
      console.log(`🔍 Analizando operación: ${operationCode}`);
      
      const response = await this.client.post('/api/chatbot/analyze-operation', {
        operation_code: operationCode
      }, {
        headers: {
          ...(this.config.apiKey && this.config.apiKey.trim() !== '' && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      return {
        success: true,
        response: response.data.analysis,
        confidence: response.data.confidence || 0.9,
        sources: ['Sistema SIEM'],
        suggested_actions: response.data.suggested_actions || [],
        model_used: 'siem-analyzer',
        timestamp: response.data.timestamp,
        session_id: response.data.session_id || `analysis_${Date.now()}`
      };
    } catch (error: any) {
      console.error('❌ Error analizando operación:', error);
      return {
        success: false,
        response: `No pude analizar la operación ${operationCode}. Verifica que el código sea correcto.`,
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
   * Generar reporte
   */
  async generateReport(
    reportType: string, 
    userId: string, 
    filters?: any
  ): Promise<SIEMResponse> {
    try {
      console.log(`📊 Generando reporte: ${reportType}`);
      
      const response = await this.client.post('/api/chatbot/generate-report', {
        report_type: reportType,
        filters: filters
      }, {
        headers: {
          ...(this.config.apiKey && this.config.apiKey.trim() !== '' && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      return {
        success: true,
        response: response.data.content,
        confidence: response.data.confidence || 0.9,
        sources: ['Sistema SIEM'],
        suggested_actions: ['Exportar reporte', 'Compartir resultados'],
        model_used: 'siem-reporter',
        timestamp: response.data.timestamp,
        session_id: `report_${Date.now()}`
      };
    } catch (error: any) {
      console.error('❌ Error generando reporte:', error);
      return {
        success: false,
        response: `No pude generar el reporte de ${reportType}. Por favor, inténtalo de nuevo.`,
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
   * Verificar estado del servicio
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('❌ SIEM Service no disponible:', error);
      return false;
    }
  }

  /**
   * Obtener historial de conversación
   */
  async getConversationHistory(sessionId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/chatbot/conversation/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      return null;
    }
  }

  /**
   * Limpiar historial de conversación
   */
  async clearConversation(sessionId: string): Promise<boolean> {
    try {
      const response = await this.client.delete(`/api/chatbot/conversation/${sessionId}`);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Error limpiando historial:', error);
      return false;
    }
  }
}
