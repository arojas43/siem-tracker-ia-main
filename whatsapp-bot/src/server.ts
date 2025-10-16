import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { WhatsAppBot } from './services/WhatsAppBot';
import { SIEMService } from './services/SIEMService';
import { WebhookService } from './services/WebhookService';
import { ChatbotConfig } from './types';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración del chatbot
const chatbotConfig: ChatbotConfig = {
  siemApiUrl: process.env.SIEM_API_URL || 'http://localhost:8000',
  siemApiToken: process.env.SIEM_API_TOKEN || '', // Dejar vacío para desarrollo
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  maxRetries: 3,
  retryDelay: 1000,
  sessionTimeout: 3600000 // 1 hora
};

// Configurar servicios
const siemService = new SIEMService({
  baseUrl: chatbotConfig.siemApiUrl,
  apiKey: chatbotConfig.siemApiToken,
  timeout: 30000
});

const whatsappBot = new WhatsAppBot(siemService);
const webhookService = new WebhookService(whatsappBot, parseInt(process.env.WEBHOOK_PORT || '3002'));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.get('/', (req, res) => {
  res.json({
    message: 'SIEM WhatsApp Bot API',
    version: '1.0.0',
    status: 'active',
    bot: whatsappBot.getStats()
  });
});

app.get('/health', (req, res) => {
  const stats = whatsappBot.getStats();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    bot: stats,
    siem: 'checking...' // Se verificaría con siemService.checkHealth()
  });
});

app.get('/qr', (req, res) => {
  const qrData = whatsappBot.getQRCodeData();
  if (qrData) {
    res.json({
      qr: qrData.qr,
      sessionName: qrData.sessionName,
      timestamp: qrData.timestamp
    });
  } else {
    res.status(404).json({ message: 'QR Code no disponible' });
  }
});

app.get('/stats', (req, res) => {
  res.json(whatsappBot.getStats());
});

app.get('/metrics', (req, res) => {
  const stats = whatsappBot.getStats();
  const performanceStats = whatsappBot.getPerformanceStats();
  const healthReport = whatsappBot.generateHealthReport();
  
  res.json({
    bot: stats,
    performance: performanceStats,
    health: healthReport,
    timestamp: new Date().toISOString()
  });
});

app.post('/restart', async (req, res) => {
  try {
    await whatsappBot.close();
    await whatsappBot.initialize();
    res.json({ message: 'Bot reiniciado exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error reiniciando bot', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Inicializar bot y webhook
async function initializeServices() {
  try {
    console.log('🚀 Iniciando SIEM WhatsApp Bot...');
    await whatsappBot.initialize();
    console.log('✅ Bot inicializado correctamente');
    
    console.log('🌐 Iniciando servicio de webhooks...');
    webhookService.start();
    console.log('✅ Servicio de webhooks iniciado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando servicios:', error);
    process.exit(1);
  }
}

// Manejo de señales para cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Recibida señal SIGINT, cerrando servicios...');
  webhookService.stop();
  await whatsappBot.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando servicios...');
  webhookService.stop();
  await whatsappBot.close();
  process.exit(0);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Servidor iniciado en puerto ${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}`);
  console.log(`🔍 Health check en http://localhost:${PORT}/health`);
  console.log(`📱 QR Code en http://localhost:${PORT}/qr`);
  
  // Inicializar servicios después de que el servidor esté listo
  initializeServices();
});
