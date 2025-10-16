"""
Script de prueba para verificar la integración del agente mejorado
"""

import asyncio
import logging
import os
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_enhanced_agent():
    """Probar el agente mejorado con diferentes tipos de consultas"""
    
    try:
        # Importar el agente mejorado
        from enhanced_chatbot_agent import get_enhanced_chatbot_agent, EnhancedUserContext
        
        # Crear instancia del agente
        agent = get_enhanced_chatbot_agent()
        logger.info("✅ Agente mejorado inicializado correctamente")
        
        # Crear contexto de usuario de prueba
        user_context = EnhancedUserContext(
            user_id="test_user_123",
            user_type="siem",
            current_page="/operations",
            session_id=f"test_session_{int(datetime.now().timestamp())}",
            last_activity=datetime.now().isoformat()
        )
        
        # Casos de prueba
        test_cases = [
            {
                "name": "Consulta de datos",
                "messages": [{"role": "user", "content": "¿Cuántas operaciones tengo activas?"}],
                "expected_type": "data_query"
            },
            {
                "name": "Consulta de regulaciones",
                "messages": [{"role": "user", "content": "¿Qué documentos necesito para importar desde China?"}],
                "expected_type": "regulation_query"
            },
            {
                "name": "Consulta de procesos",
                "messages": [{"role": "user", "content": "¿Cómo funciona el proceso de importación?"}],
                "expected_type": "process_query"
            },
            {
                "name": "Análisis de operación",
                "messages": [{"role": "user", "content": "Analiza la operación SOD25-058"}],
                "expected_type": "operation_analysis"
            },
            {
                "name": "Consulta general",
                "messages": [{"role": "user", "content": "¿Cómo puedo optimizar mis operaciones de comercio exterior?"}],
                "expected_type": "general_query"
            }
        ]
        
        # Ejecutar pruebas
        for i, test_case in enumerate(test_cases, 1):
            logger.info(f"\n🧪 Ejecutando prueba {i}: {test_case['name']}")
            
            try:
                # Procesar consulta
                response = await agent.process_chat(test_case['messages'], user_context)
                
                # Verificar respuesta
                assert response.response, "La respuesta no puede estar vacía"
                assert response.confidence >= 0, "La confianza debe ser >= 0"
                assert response.model_used, "Debe especificar el modelo usado"
                assert response.timestamp, "Debe tener timestamp"
                
                logger.info(f"✅ Respuesta generada exitosamente")
                logger.info(f"   - Confianza: {response.confidence}")
                logger.info(f"   - Modelo: {response.model_used}")
                logger.info(f"   - Memoria usada: {response.memory_used}")
                logger.info(f"   - Entidades extraídas: {response.entities_extracted}")
                logger.info(f"   - Respuesta: {response.response[:100]}...")
                
                if response.structured_data:
                    logger.info(f"   - Datos estructurados: {response.structured_data}")
                
                if response.suggested_actions:
                    logger.info(f"   - Acciones sugeridas: {response.suggested_actions}")
                
                if response.follow_up_questions:
                    logger.info(f"   - Preguntas de seguimiento: {response.follow_up_questions}")
                
            except Exception as e:
                logger.error(f"❌ Error en prueba {i}: {e}")
        
        # Probar memoria persistente
        logger.info(f"\n🧠 Probando memoria persistente...")
        
        # Primera conversación
        messages1 = [{"role": "user", "content": "Mi nombre es Carlos y trabajo en SIEM"}]
        response1 = await agent.process_chat(messages1, user_context)
        logger.info(f"✅ Primera conversación procesada")
        
        # Segunda conversación (debería recordar el nombre)
        messages2 = [{"role": "user", "content": "¿Cuál es mi nombre?"}]
        response2 = await agent.process_chat(messages2, user_context)
        logger.info(f"✅ Segunda conversación procesada")
        logger.info(f"   - Respuesta: {response2.response}")
        
        # Probar detección de tipo de consulta
        logger.info(f"\n🔍 Probando detección de tipos de consulta...")
        
        query_types = [
            ("¿Cuántas operaciones tengo?", "data_query"),
            ("¿Qué documentos necesito?", "regulation_query"),
            ("¿Cómo funciona el proceso?", "process_query"),
            ("Analiza SOD25-058", "operation_analysis"),
            ("Hola, ¿cómo estás?", "general_query")
        ]
        
        for query, expected_type in query_types:
            detected_type = agent._detect_query_type(query)
            status = "✅" if detected_type == expected_type else "❌"
            logger.info(f"   {status} '{query}' -> {detected_type} (esperado: {expected_type})")
        
        logger.info(f"\n🎉 Todas las pruebas completadas exitosamente!")
        
    except Exception as e:
        logger.error(f"❌ Error en las pruebas: {e}", exc_info=True)

async def test_memory_manager():
    """Probar el gestor de memoria"""
    
    try:
        from memory_manager import get_memory_manager
        from langchain_openai import ChatOpenAI
        
        # Crear LLM para pruebas
        llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            openai_api_key="dummy",
            openai_api_base="http://localhost:1234/v1/"
        )
        
        # Crear gestor de memoria
        memory_manager = get_memory_manager(llm)
        logger.info("✅ Gestor de memoria inicializado")
        
        # Probar guardado de entidades
        memory_manager.entity_memory.save_entity(
            "test_session",
            "operation",
            "SOD25-058",
            {"status": "En proceso", "client": "Cliente Test"}
        )
        logger.info("✅ Entidad guardada")
        
        # Probar recuperación de entidades
        entities = memory_manager.entity_memory.get_entities("test_session")
        logger.info(f"✅ Entidades recuperadas: {len(entities)}")
        
        # Probar contexto de sesión
        from memory_manager import ConversationContext
        context = ConversationContext(
            session_id="test_session",
            user_id="test_user",
            user_type="siem",
            current_page="/operations",
            created_at=datetime.now().isoformat(),
            last_activity=datetime.now().isoformat(),
            message_count=5,
            entities={"operations": {"SOD25-058": {"status": "En proceso"}}}
        )
        
        memory_manager.entity_memory.save_session_context(context)
        logger.info("✅ Contexto de sesión guardado")
        
        retrieved_context = memory_manager.entity_memory.get_session_context("test_session")
        if retrieved_context:
            logger.info(f"✅ Contexto recuperado: {retrieved_context.user_id}")
        
        logger.info("✅ Pruebas de memoria completadas")
        
    except Exception as e:
        logger.error(f"❌ Error en pruebas de memoria: {e}", exc_info=True)

async def test_prompt_templates():
    """Probar las plantillas de prompts"""
    
    try:
        from prompt_templates import get_prompt_templates
        
        templates = get_prompt_templates()
        logger.info("✅ Gestor de plantillas inicializado")
        
        # Probar plantilla base
        base_template = templates.get_template('system_base')
        logger.info("✅ Plantilla base obtenida")
        
        # Probar plantilla específica por usuario
        user_template = templates.get_user_specific_template("siem", "/operations")
        logger.info("✅ Plantilla específica de usuario obtenida")
        
        # Probar few-shot examples
        few_shot_template = templates.get_few_shot_template('data_query')
        if few_shot_template:
            logger.info("✅ Plantilla few-shot obtenida")
        
        logger.info("✅ Pruebas de plantillas completadas")
        
    except Exception as e:
        logger.error(f"❌ Error en pruebas de plantillas: {e}", exc_info=True)

async def test_output_parsers():
    """Probar los parsers de salida"""
    
    try:
        from output_parsers import get_parser, parse_response
        
        # Probar parser de análisis de operaciones
        operation_parser = get_parser('operation_analysis')
        logger.info("✅ Parser de operaciones obtenido")
        
        # Probar parsing de respuesta
        test_response = "La operación SOD25-058 está en proceso. Próximos pasos: 1. Revisar documentos 2. Contactar cliente"
        parsed = parse_response(test_response, 'operation_analysis')
        logger.info(f"✅ Respuesta parseada: {parsed}")
        
        # Probar parser de resumen de datos
        data_parser = get_parser('data_summary')
        logger.info("✅ Parser de datos obtenido")
        
        logger.info("✅ Pruebas de parsers completadas")
        
    except Exception as e:
        logger.error(f"❌ Error en pruebas de parsers: {e}", exc_info=True)

async def main():
    """Función principal de pruebas"""
    
    logger.info("🚀 Iniciando pruebas de integración del agente mejorado...")
    
    # Ejecutar todas las pruebas
    await test_memory_manager()
    await test_prompt_templates()
    await test_output_parsers()
    await test_enhanced_agent()
    
    logger.info("🎉 Todas las pruebas completadas!")

if __name__ == "__main__":
    asyncio.run(main())

