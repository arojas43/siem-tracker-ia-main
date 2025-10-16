# Chatbot Mejorado de SIEM con LangChain Avanzado

## 🚀 Resumen de Mejoras Implementadas

Este documento describe las mejoras implementadas en el chatbot de SIEM utilizando funcionalidades avanzadas de LangChain para crear un sistema más robusto, inteligente y eficiente.

## 📋 Características Implementadas

### 1. **Sistema de Mensajes de Chat Robusto**
- ✅ **HumanMessage, AIMessage, SystemMessage**: Gestión estructurada de mensajes
- ✅ **FunctionMessage**: Soporte para resultados de herramientas
- ✅ **ChatPromptTemplate**: Plantillas dinámicas y reutilizables
- ✅ **MessagesPlaceholder**: Integración fluida del historial de chat

### 2. **Sistema de Memoria Avanzado**
- ✅ **ConversationBufferWindowMemory**: Memoria de corto plazo (últimos 10 mensajes)
- ✅ **ConversationSummaryMemory**: Resúmenes automáticos de conversaciones largas
- ✅ **ConversationEntityMemory**: Memoria de entidades específicas (operaciones, clientes, etc.)
- ✅ **CombinedMemory**: Integración de múltiples tipos de memoria
- ✅ **Base de datos SQLite**: Persistencia de memoria entre sesiones

### 3. **Plantillas Dinámicas de Prompts**
- ✅ **PromptTemplate**: Plantillas base reutilizables
- ✅ **FewShotPromptTemplate**: Ejemplos contextuales para mejor comprensión
- ✅ **Plantillas específicas por usuario**: Diferentes prompts para SIEM vs Cliente
- ✅ **Plantillas contextuales**: Adaptación según la página actual del usuario
- ✅ **Plantillas especializadas**: Diferentes prompts para datos, regulaciones, procesos

### 4. **Output Parsers JSON Avanzados**
- ✅ **JsonOutputParser**: Respuestas estructuradas en formato JSON
- ✅ **Parsers personalizados**: Específicos para análisis de operaciones, resúmenes de datos
- ✅ **Validación con Pydantic**: Modelos de datos estructurados y validados
- ✅ **Parsers inteligentes**: Extracción automática de entidades y metadatos

### 5. **LCEL (LangChain Expression Language)**
- ✅ **Cadenas modulares**: Flujos de procesamiento claros y mantenibles
- ✅ **RunnableLambda**: Funciones personalizadas en las cadenas
- ✅ **RunnableParallel**: Procesamiento paralelo cuando es posible
- ✅ **Composición de componentes**: Integración fluida entre diferentes módulos

### 6. **Gestión de Historial y Contexto**
- ✅ **Buffer de ventana deslizante**: Mantiene contexto relevante sin sobrecargar
- ✅ **Resúmenes automáticos**: Para conversaciones largas
- ✅ **Extracción de entidades**: Identificación automática de operaciones, clientes, etc.
- ✅ **Contexto persistente**: Memoria entre sesiones del usuario

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   API LAYER (FastAPI)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Chat Endpoint │  │ Analysis Endpt  │  │ Report Endpt│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              ENHANCED CHATBOT AGENT                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Memory Manager │  │ Prompt Templates│  │Output Parsers│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   LCEL Chains   │  │  Data Retriever │  │   Context   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                LANGCHAIN CORE                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Chat Models   │  │    Memory       │  │   Prompts   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                EXTERNAL SERVICES                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   LM Studio     │  │   SIEM Backend  │  │   SQLite DB │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Archivos

```
backend/
├── enhanced_chatbot_agent.py      # Agente principal mejorado
├── memory_manager.py              # Gestión de memoria robusta
├── prompt_templates.py            # Plantillas dinámicas de prompts
├── output_parsers.py              # Parsers de salida JSON
├── chatbot_api.py                 # API actualizada
├── test_enhanced_integration.py   # Script de pruebas
├── siem_memory.db                 # Base de datos de memoria (generada)
└── ENHANCED_CHATBOT_README.md     # Esta documentación
```

## 🔧 Configuración y Uso

### 1. **Instalación de Dependencias**

```bash
pip install -r requirements.txt
```

### 2. **Variables de Entorno**

```bash
# Configuración del LLM
LM_STUDIO_URL=http://localhost:1234
LM_STUDIO_MODEL=openai/gpt-oss-20b

# Configuración de SIEM
SIEM_API_BASE_URL=http://localhost:8000
SIEM_API_TOKEN=your-token

# Configuración de la aplicación
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8001

# Opcional: desactivar RAG temporalmente para pruebas sin vector store
DISABLE_RAG=true
```

### 3. **Ejecución del Servidor**

```bash
python main.py
```

### 4. **Pruebas de Integración**

```bash
python test_enhanced_integration.py
```

## 🧩 Personalización desde el Frontend

### Enviar preferencias del usuario en el contexto
- El endpoint `POST /deepchat` (y `POST /chat`) acepta un objeto `context.preferences` para personalizar respuestas por usuario.
- Esas preferencias se inyectan como `SystemMessage` al inicio de todos los prompts del agente mejorado.
- Puedes enviar cualquier clave/valor útil para tu UI: idioma, tono, formato de salida, filtros de datos, entidad enfocada, etc.

**Ejemplo `POST /deepchat`**

```json
{
  "messages": [
    { "role": "user", "text": "Resúmeme mis operaciones activas" }
  ],
  "user_id": "cliente_123",
  "context": {
    "user_type": "client",
    "current_page": "/operations",
    "preferences": {
      "language": "es",
      "tone": "formal",
      "output_format": "markdown",
      "focus_entities": ["operaciones_activas"],
      "filters": { "priority": "alta" }
    }
  }
}
```

**Ejemplo `POST /chat`**

```json
{
  "message": "¿Qué documentos necesito para la operación SOD25-058?",
  "user_id": "siem_admin",
  "context": {
    "user_type": "siem",
    "current_page": "/customs",
    "preferences": {
      "language": "es",
      "output_format": "html",
      "timezone": "America/Mexico_City"
    }
  },
  "session_id": "session_ui_987"
}
```

### Notas
- Si hay JWT, se prioriza el `user_id` del token y el `user_type` de los claims salvo que el frontend lo explicite en `context.user_type`.
- Con `DISABLE_RAG=true` el agente no consultará documentos vectoriales, ideal para pruebas enfocadas en personalización por usuario.
- El agente usa `preferences` para ajustar tono, formato y enfoque, conservando el historial y memoria.

## 🎯 Tipos de Consultas Soportadas

### 1. **Consultas de Datos** (`data_query`)
- Análisis de operaciones
- Estadísticas de clientes y proveedores
- Resúmenes de tareas
- Métricas del sistema

**Ejemplo:**
```json
{
  "message": "¿Cuántas operaciones tengo activas?",
  "context": {
    "user_type": "siem",
    "current_page": "/operations"
  }
}
```

### 2. **Consultas de Regulaciones** (`regulation_query`)
- Documentos requeridos
- Aranceles y códigos HS
- Normativas aduaneras
- Requisitos del SAT

**Ejemplo:**
```json
{
  "message": "¿Qué documentos necesito para importar desde China?",
  "context": {
    "user_type": "client",
    "current_page": "/customs"
  }
}
```

### 3. **Consultas de Procesos** (`process_query`)
- Flujos de trabajo
- Procedimientos paso a paso
- Guías operativas
- Mejores prácticas

**Ejemplo:**
```json
{
  "message": "¿Cómo funciona el proceso de importación?",
  "context": {
    "user_type": "siem",
    "current_page": "/help"
  }
}
```

### 4. **Análisis de Operaciones** (`operation_analysis`)
- Estado detallado de operaciones
- Próximos pasos recomendados
- Identificación de riesgos
- Oportunidades de mejora

**Ejemplo:**
```json
{
  "message": "Analiza la operación SOD25-058",
  "context": {
    "user_type": "siem",
    "current_page": "/operations"
  }
}
```

## 📊 Respuestas Estructuradas

### Formato de Respuesta Mejorado

```json
{
  "response": "Respuesta principal del chatbot",
  "structured_data": {
    "operation_code": "SOD25-058",
    "status": "En proceso",
    "priority": "alta",
    "next_steps": ["Revisar documentos", "Contactar cliente"],
    "risks": ["Documentos pendientes"],
    "opportunities": ["Optimización de proceso"],
    "confidence_score": 0.9
  },
  "confidence": 0.9,
  "sources": ["Base de datos SIEM", "Datos en tiempo real"],
  "suggested_actions": ["Ver detalles completos", "Exportar datos"],
  "follow_up_questions": ["¿Te gustaría analizar otra operación?"],
  "model_used": "gpt-4o-mini",
  "timestamp": "2024-01-15T10:30:00Z",
  "session_id": "session_1234567890",
  "memory_used": true,
  "entities_extracted": ["SOD25-058", "Cliente Ejemplo"]
}
```

## 🧠 Sistema de Memoria

### Características de la Memoria

1. **Memoria de Corto Plazo**: Últimos 10 mensajes de la conversación
2. **Memoria de Resumen**: Resúmenes automáticos para conversaciones largas
3. **Memoria de Entidades**: Rastrea operaciones, clientes, proveedores mencionados
4. **Memoria Persistente**: Almacenamiento en SQLite entre sesiones

### Base de Datos de Memoria

```sql
-- Tabla de entidades de conversación
CREATE TABLE conversation_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de resúmenes de conversación
CREATE TABLE conversation_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    message_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de contexto de sesión
CREATE TABLE session_context (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_type TEXT NOT NULL,
    current_page TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    context_data TEXT
);
```

## 🔄 Flujo de Procesamiento

### 1. **Recepción de Consulta**
```python
# El usuario envía una consulta
request = {
    "message": "¿Cuántas operaciones tengo activas?",
    "user_id": "carlos.martinez@siem.business",
    "context": {
        "user_type": "siem",
        "current_page": "/operations"
    }
}
```

### 2. **Detección de Tipo de Consulta**
```python
# El sistema detecta automáticamente el tipo
query_type = agent._detect_query_type("¿Cuántas operaciones tengo activas?")
# Resultado: "data_query"
```

### 3. **Obtención de Contexto de Memoria**
```python
# Se obtiene el contexto de memoria del usuario
memory_context = memory_manager.get_memory_variables(session_id)
```

### 4. **Selección de Cadena LCEL**
```python
# Se selecciona la cadena apropiada según el tipo de consulta
if query_type == 'data_query':
    response = await data_query_chain.ainvoke(chain_input)
```

### 5. **Formateo de Prompt**
```python
# Se formatea el prompt con contexto y plantillas
prompt = prompt_templates.get_template('data_query', **context_vars)
```

### 6. **Procesamiento con LLM**
```python
# Se procesa con el modelo de lenguaje
llm_response = await llm.ainvoke(formatted_messages)
```

### 7. **Parsing de Respuesta**
```python
# Se parsea la respuesta a formato estructurado
structured_data = parse_response(response_text, 'data_summary')
```

### 8. **Actualización de Memoria**
```python
# Se actualiza la memoria con la nueva conversación
memory_manager.update_memory_with_messages(session_id, messages)
```

## 🚀 Beneficios de las Mejoras

### 1. **Mejor Experiencia de Usuario**
- Respuestas más contextuales y relevantes
- Memoria de conversaciones anteriores
- Sugerencias de seguimiento inteligentes

### 2. **Mayor Eficiencia Operacional**
- Detección automática del tipo de consulta
- Procesamiento optimizado según el contexto
- Respuestas estructuradas para integración

### 3. **Escalabilidad y Mantenibilidad**
- Arquitectura modular con LCEL
- Plantillas reutilizables y configurables
- Parsers especializados por tipo de respuesta

### 4. **Inteligencia Avanzada**
- Extracción automática de entidades
- Análisis de contexto y preferencias
- Memoria persistente entre sesiones

## 🔧 Mantenimiento y Monitoreo

### 1. **Logs del Sistema**
```python
# Los logs incluyen información detallada
logger.info(f"Tipo de consulta detectado: {query_type}")
logger.info(f"Memoria usada: {response.memory_used}")
logger.info(f"Entidades extraídas: {response.entities_extracted}")
```

### 2. **Métricas de Rendimiento**
- Tiempo de respuesta por tipo de consulta
- Uso de memoria por sesión
- Precisión de detección de tipos de consulta
- Satisfacción del usuario (confianza en respuestas)

### 3. **Monitoreo de la Base de Datos**
```sql
-- Consultar uso de memoria
SELECT session_id, COUNT(*) as entity_count 
FROM conversation_entities 
GROUP BY session_id 
ORDER BY entity_count DESC;

-- Consultar resúmenes generados
SELECT session_id, message_count, created_at 
FROM conversation_summaries 
ORDER BY created_at DESC;
```

## 🎯 Próximos Pasos

### 1. **Mejoras Futuras**
- Integración con Redis para memoria distribuida
- Análisis de sentimientos en conversaciones
- Aprendizaje automático de preferencias del usuario
- Integración con sistemas de BI para análisis avanzado

### 2. **Optimizaciones**
- Cache de respuestas frecuentes
- Compresión de memoria para conversaciones muy largas
- Paralelización de consultas de datos
- Optimización de prompts basada en feedback

### 3. **Nuevas Funcionalidades**
- Generación automática de reportes
- Alertas proactivas basadas en análisis
- Integración con sistemas de notificaciones
- API para integración con otros sistemas

## 📞 Soporte y Contacto

Para soporte técnico o consultas sobre la implementación:
- **Equipo de Desarrollo**: desarrollo@siem.business
- **Documentación**: Ver archivos README en cada módulo
- **Issues**: Reportar en el repositorio del proyecto

---

**Versión**: 2.0.0  
**Última actualización**: Enero 2024  
**Compatibilidad**: LangChain 0.1.0+, Python 3.8+

