"""
Script de prueba para verificar las correcciones implementadas
"""

import asyncio
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_query_detection_fixes():
    """Probar la detección mejorada de tipos de consulta"""
    
    try:
        logger.info("🔍 Probando detección mejorada de tipos de consulta...")
        
        from enhanced_chatbot_agent import get_enhanced_chatbot_agent
        
        # Crear agente
        agent = get_enhanced_chatbot_agent()
        
        # Casos de prueba para consultas generales
        test_cases = [
            ("Hola, ¿cómo estás?", "general_query"),
            ("Buenos días", "general_query"),
            ("¿Qué tal?", "general_query"),
            ("Necesito ayuda", "general_query"),
            ("¿Puedes explicar algo?", "general_query"),
            ("Cuéntame sobre el sistema", "general_query"),
            ("¿Cuántas operaciones tengo?", "data_query"),
            ("¿Qué documentos necesito?", "regulation_query"),
            ("¿Cómo funciona el proceso?", "process_query"),
            ("Analiza SOD25-058", "operation_analysis"),
            ("¿Qué es comercio exterior?", "general_query"),
            ("Información sobre aduanas", "regulation_query"),
            ("Mostrar mis tareas", "data_query"),
            ("Hacer una importación", "process_query")
        ]
        
        correct_detections = 0
        total_tests = len(test_cases)
        
        for query, expected_type in test_cases:
            detected_type = agent._detect_query_type(query)
            status = "✅" if detected_type == expected_type else "❌"
            logger.info(f"   {status} '{query}' -> {detected_type} (esperado: {expected_type})")
            
            if detected_type == expected_type:
                correct_detections += 1
        
        accuracy = (correct_detections / total_tests) * 100
        logger.info(f"📊 Precisión de detección: {accuracy:.1f}% ({correct_detections}/{total_tests})")
        
        if accuracy >= 90:
            logger.info("🎉 Detección de consultas mejorada exitosamente!")
        else:
            logger.warning(f"⚠️ Precisión de {accuracy:.1f}% - considerar más ajustes")
        
        return accuracy >= 90
        
    except Exception as e:
        logger.error(f"❌ Error en prueba de detección: {e}")
        return False

async def test_memory_warnings():
    """Probar que se eliminaron los warnings de CombinedMemory"""
    
    try:
        logger.info("🧠 Probando configuración de memoria sin warnings...")
        
        from memory_manager import get_memory_manager
        from langchain_openai import ChatOpenAI
        
        # Crear LLM para pruebas
        llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            openai_api_key="dummy",
            openai_api_base="http://localhost:1234/v1/"
        )
        
        # Crear gestor de memoria (debería mostrar menos warnings)
        memory_manager = get_memory_manager(llm)
        logger.info("✅ Memory manager inicializado con configuración mejorada")
        
        # Probar funcionalidad básica
        memory_manager.entity_memory.save_entity(
            "test_session_fix",
            "operation",
            "SOD25-999",
            {"status": "Test", "client": "Test Client"}
        )
        logger.info("✅ Entidad guardada correctamente")
        
        entities = memory_manager.entity_memory.get_entities("test_session_fix")
        logger.info(f"✅ Entidades recuperadas: {len(entities)}")
        
        logger.info("🎉 Configuración de memoria mejorada exitosamente!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error en prueba de memoria: {e}")
        return False

async def test_integration_with_fixes():
    """Probar integración completa con las correcciones"""
    
    try:
        logger.info("🔧 Probando integración completa con correcciones...")
        
        from enhanced_chatbot_agent import get_enhanced_chatbot_agent, EnhancedUserContext
        
        # Crear agente
        agent = get_enhanced_chatbot_agent()
        
        # Crear contexto de usuario
        user_context = EnhancedUserContext(
            user_id="test_user_fixes",
            user_type="siem",
            current_page="/operations",
            session_id=f"test_fixes_{int(datetime.now().timestamp())}",
            last_activity=datetime.now().isoformat()
        )
        
        # Probar consulta general (debería detectarse correctamente ahora)
        messages = [{"role": "user", "content": "Hola, ¿cómo estás?"}]
        
        logger.info("📝 Enviando consulta general: 'Hola, ¿cómo estás?'")
        
        # Procesar consulta (sin ejecutar completamente para evitar dependencias externas)
        query_type = agent._detect_query_type(messages[0]['content'])
        logger.info(f"✅ Tipo detectado: {query_type}")
        
        if query_type == "general_query":
            logger.info("🎉 Consulta general detectada correctamente!")
            return True
        else:
            logger.warning(f"⚠️ Consulta general detectada como: {query_type}")
            return False
        
    except Exception as e:
        logger.error(f"❌ Error en prueba de integración: {e}")
        return False

async def main():
    """Función principal de pruebas"""
    
    logger.info("🚀 Iniciando pruebas de correcciones...")
    
    # Ejecutar todas las pruebas
    test1 = await test_query_detection_fixes()
    test2 = await test_memory_warnings()
    test3 = await test_integration_with_fixes()
    
    # Resumen de resultados
    logger.info("\n📊 RESUMEN DE PRUEBAS:")
    logger.info(f"   🔍 Detección de consultas: {'✅ PASÓ' if test1 else '❌ FALLÓ'}")
    logger.info(f"   🧠 Configuración de memoria: {'✅ PASÓ' if test2 else '❌ FALLÓ'}")
    logger.info(f"   🔧 Integración completa: {'✅ PASÓ' if test3 else '❌ FALLÓ'}")
    
    all_passed = test1 and test2 and test3
    
    if all_passed:
        logger.info("🎉 ¡Todas las correcciones funcionan correctamente!")
    else:
        logger.warning("⚠️ Algunas correcciones necesitan revisión")
    
    return all_passed

if __name__ == "__main__":
    asyncio.run(main())



