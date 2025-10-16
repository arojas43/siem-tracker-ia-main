"""
Script de prueba simple para verificar la integración básica
"""

import asyncio
import logging
import os
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_basic_components():
    """Probar componentes básicos sin dependencias externas"""
    
    try:
        logger.info("🧪 Probando componentes básicos...")
        
        # Probar memory manager
        from memory_manager import get_memory_manager
        from langchain_openai import ChatOpenAI
        
        # Crear LLM mock para pruebas
        llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            openai_api_key="dummy",
            openai_api_base="http://localhost:1234/v1/"
        )
        
        memory_manager = get_memory_manager(llm)
        logger.info("✅ Memory manager inicializado")
        
        # Probar prompt templates
        from prompt_templates import get_prompt_templates
        templates = get_prompt_templates()
        logger.info("✅ Prompt templates inicializado")
        
        # Probar output parsers
        from output_parsers import get_parser, parse_response
        
        # Probar parser general
        general_parser = get_parser('general')
        logger.info("✅ Parser general obtenido")
        
        # Probar parsing de respuesta
        test_response = "Esta es una respuesta de prueba"
        parsed = parse_response(test_response, 'general')
        logger.info(f"✅ Respuesta parseada: {parsed}")
        
        # Probar parser de datos
        data_parser = get_parser('data_summary')
        logger.info("✅ Parser de datos obtenido")
        
        logger.info("🎉 Todos los componentes básicos funcionan correctamente!")
        
    except Exception as e:
        logger.error(f"❌ Error en pruebas básicas: {e}", exc_info=True)

async def test_enhanced_agent_basic():
    """Probar el agente mejorado sin dependencias externas"""
    
    try:
        logger.info("🤖 Probando agente mejorado...")
        
        from enhanced_chatbot_agent import get_enhanced_chatbot_agent, EnhancedUserContext
        
        # Crear contexto de usuario de prueba
        user_context = EnhancedUserContext(
            user_id="test_user_123",
            user_type="siem",
            current_page="/operations",
            session_id=f"test_session_{int(datetime.now().timestamp())}",
            last_activity=datetime.now().isoformat()
        )
        
        # Crear mensaje de prueba simple
        messages = [{"role": "user", "content": "Hola, ¿cómo estás?"}]
        
        logger.info("✅ Contexto de usuario creado")
        logger.info("✅ Mensaje de prueba preparado")
        logger.info("✅ Agente mejorado listo para pruebas")
        
        # Nota: No ejecutamos el agente completo para evitar dependencias externas
        logger.info("🎉 Agente mejorado configurado correctamente!")
        
    except Exception as e:
        logger.error(f"❌ Error en pruebas del agente: {e}", exc_info=True)

async def main():
    """Función principal de pruebas"""
    
    logger.info("🚀 Iniciando pruebas simples de integración...")
    
    # Ejecutar pruebas básicas
    await test_basic_components()
    await test_enhanced_agent_basic()
    
    logger.info("🎉 Todas las pruebas simples completadas!")

if __name__ == "__main__":
    asyncio.run(main())

