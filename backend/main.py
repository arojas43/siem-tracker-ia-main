"""
Servidor principal para el chatbot de comercio exterior de SIEM
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

from chatbot_api import router as chatbot_router

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    # Startup
    logger.info("🚀 Iniciando servidor del chatbot de SIEM...")
    
    # Verificar que LM Studio esté disponible
    lm_studio_url = os.getenv('LM_STUDIO_URL', 'http://localhost:1234')
    logger.info(f"✅ Configurado para usar LM Studio: {lm_studio_url}")
    
    logger.info("✅ Servidor del chatbot iniciado correctamente")
    
    yield
    
    # Shutdown
    logger.info("🛑 Cerrando servidor del chatbot...")

# Crear aplicación FastAPI
app = FastAPI(
    title="SIEM Chatbot API",
    description="API para el chatbot especializado en comercio exterior de SIEM",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend de desarrollo
        "http://localhost:5173",  # Frontend Vite
        "http://localhost:5180",  # Frontend Vite (puerto alterno)
        "http://localhost:8080",  # Frontend de producción
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5180",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Middleware de seguridad
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.siem.com"]
)

# Incluir routers
app.include_router(chatbot_router)

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "SIEM Chatbot API",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "siem-chatbot",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    # Configuración del servidor
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    
    logger.info(f"🌐 Iniciando servidor en {host}:{port}")
    logger.info(f"📚 Documentación disponible en http://{host}:{port}/docs")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
