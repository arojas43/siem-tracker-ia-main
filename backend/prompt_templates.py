"""
Sistema de plantillas dinámicas de prompts para el chatbot de SIEM
Incluye few-shot prompting y plantillas contextuales
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime

from langchain_core.prompts import (
    ChatPromptTemplate,
    PromptTemplate,
    FewShotPromptTemplate,
    MessagesPlaceholder
)
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

logger = logging.getLogger(__name__)

class SIEMPromptTemplates:
    """Gestor de plantillas de prompts para SIEM"""
    
    def __init__(self):
        self.templates = {}
        self.few_shot_examples = {}
        self._load_templates()
        self._load_few_shot_examples()
    
    def _load_templates(self):
        """Cargar plantillas base"""
        
        # Plantilla base del sistema
        self.templates['system_base'] = ChatPromptTemplate.from_messages([
            ("system", """Eres un asistente especializado en comercio exterior y aduanas para SIEM (Sistema de Importación y Exportación de México).

Tu especialización incluye:
- Regulaciones aduaneras mexicanas e internacionales
- Procesos de importación y exportación
- Documentación requerida para operaciones comerciales
- Clasificación arancelaria y códigos HS
- Tratados comerciales y acuerdos internacionales
- Procedimientos aduaneros y fiscalización
- Logística internacional y transporte
- Análisis de datos de operaciones comerciales

INSTRUCCIONES IMPORTANTES:
1. Siempre proporciona información precisa y actualizada sobre comercio exterior
2. Cuando el usuario pregunte sobre datos específicos de SIEM, utiliza la información proporcionada en el contexto
3. Si no tienes información específica, sugiere consultar con un especialista
4. Mantén un tono profesional pero accesible
5. Proporciona ejemplos prácticos cuando sea relevante
6. Si la consulta es sobre datos del sistema, estructura la respuesta de manera clara y organizada

CONTEXTO DEL SISTEMA SIEM:
- El usuario está trabajando con operaciones de importación/exportación
- Tienes acceso a datos de operaciones, tareas, clientes, proveedores y aduanas
- Puedes ayudar con consultas sobre el estado de operaciones y procesos
- Puedes proporcionar análisis de datos operacionales

Responde en español y de manera útil y precisa."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        # Plantilla para consultas de datos
        self.templates['data_query'] = ChatPromptTemplate.from_messages([
            ("system", """Eres un analista especializado en datos de comercio exterior para SIEM.

Tu tarea es analizar y presentar datos de operaciones, clientes, proveedores y aduanas de manera clara y útil.

CONTEXTO DE DATOS DISPONIBLES:
{data_context}

ENTIDADES MENCIONADAS:
{entities_context}

INSTRUCCIONES:
1. Analiza los datos proporcionados de manera estructurada
2. Identifica patrones, tendencias y puntos importantes
3. Proporciona insights relevantes para el negocio
4. Si los datos son limitados, menciona esta limitación
5. Sugiere acciones concretas basadas en el análisis
6. Usa formato claro con viñetas y secciones

Responde en español con un análisis detallado y útil."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        # Plantilla para consultas de regulaciones
        self.templates['regulation_query'] = ChatPromptTemplate.from_messages([
            ("system", """Eres un especialista en regulaciones aduaneras y comercio exterior para SIEM.

Tu especialización incluye:
- Regulaciones del SAT (Servicio de Administración Tributaria)
- Normativas de la OMC (Organización Mundial del Comercio)
- Tratados comerciales internacionales
- Códigos arancelarios y clasificación HS
- Documentación requerida para importaciones/exportaciones
- Procedimientos aduaneros específicos

INSTRUCCIONES:
1. Proporciona información precisa y actualizada sobre regulaciones
2. Cita las fuentes normativas cuando sea posible
3. Explica los requisitos de manera clara y estructurada
4. Proporciona ejemplos prácticos cuando sea relevante
5. Si la información es compleja, desglósala en pasos
6. Siempre menciona que las regulaciones pueden cambiar

Responde en español con información detallada y precisa."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        # Plantilla para consultas de procesos
        self.templates['process_query'] = ChatPromptTemplate.from_messages([
            ("system", """Eres un consultor especializado en procesos de comercio exterior para SIEM.

Tu experiencia incluye:
- Flujos de trabajo de importación y exportación
- Procedimientos aduaneros paso a paso
- Gestión de documentos y permisos
- Coordinación entre diferentes actores del proceso
- Optimización de procesos logísticos
- Mejores prácticas en comercio exterior

INSTRUCCIONES:
1. Describe los procesos de manera secuencial y clara
2. Identifica los pasos críticos y puntos de control
3. Menciona los documentos y permisos requeridos en cada paso
4. Proporciona tiempos estimados cuando sea posible
5. Sugiere mejores prácticas y optimizaciones
6. Incluye consideraciones especiales y excepciones

Responde en español con una guía detallada del proceso."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        # Plantilla para análisis de operaciones específicas
        self.templates['operation_analysis'] = ChatPromptTemplate.from_messages([
            ("system", """Eres un analista especializado en operaciones de comercio exterior para SIEM.

Tu tarea es analizar operaciones específicas y proporcionar insights detallados.

DATOS DE LA OPERACIÓN:
{operation_data}

CONTEXTO ADICIONAL:
{additional_context}

INSTRUCCIONES:
1. Analiza el estado actual de la operación
2. Identifica fechas importantes y hitos críticos
3. Revisa documentos pendientes y requisitos
4. Sugiere próximos pasos y acciones recomendadas
5. Identifica riesgos potenciales y oportunidades
6. Proporciona un resumen ejecutivo claro

Responde en español con un análisis completo y accionable."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
    
    def _load_few_shot_examples(self):
        """Cargar ejemplos few-shot para diferentes tipos de consultas"""
        
        # Ejemplos para consultas de datos
        self.few_shot_examples['data_query'] = [
            {
                "input": "¿Cuántas operaciones tengo activas?",
                "output": """Basándome en los datos disponibles, tienes **X operaciones activas** en el sistema.

**Resumen por estado:**
- En proceso: X operaciones
- Pendientes: X operaciones  
- Completadas: X operaciones

**Operaciones destacadas:**
- SOD25-058: En proceso de documentación
- SOD25-059: Pendiente de aduana
- SOD25-060: Completada exitosamente

**Recomendaciones:**
1. Revisar operaciones pendientes que requieren atención
2. Verificar documentos faltantes en operaciones en proceso
3. Seguir el flujo de trabajo para operaciones próximas a completar

¿Te gustaría que analice alguna operación específica en detalle?"""
            },
            {
                "input": "¿Cuál es el estado de la operación SOD25-058?",
                "output": """**Análisis de la Operación SOD25-058:**

**Estado Actual:** En proceso de documentación
**Cliente:** [Nombre del cliente]
**Fecha de creación:** [Fecha]
**Última actualización:** [Fecha]

**Progreso:**
✅ Documentos iniciales completados
✅ Clasificación arancelaria realizada
⏳ Pendiente: Permisos de importación
⏳ Pendiente: Certificados de origen

**Próximos pasos recomendados:**
1. Solicitar permisos faltantes al SAT
2. Coordinar con el proveedor para certificados
3. Programar inspección aduanera
4. Preparar documentación final

**Tiempo estimado para completar:** 5-7 días hábiles

¿Necesitas ayuda con algún paso específico de esta operación?"""
            }
        ]
        
        # Ejemplos para consultas de regulaciones
        self.few_shot_examples['regulation_query'] = [
            {
                "input": "¿Qué documentos necesito para importar desde China?",
                "output": """**Documentos requeridos para importación desde China:**

**Documentos del Exportador:**
- Factura comercial (Invoice)
- Lista de empaque (Packing List)
- Certificado de origen
- Certificado fitosanitario (si aplica)
- Certificado de calidad (si aplica)

**Documentos del Importador:**
- Pedimento de importación
- Cédula de identificación fiscal (RFC)
- Poder notarial (si aplica)
- Permisos especiales según el producto

**Documentos de Transporte:**
- Conocimiento de embarque (Bill of Lading)
- Guía aérea (Air Waybill) si es por avión
- Carta de porte si es terrestre

**Consideraciones especiales:**
- Verificar si el producto requiere NOM (Norma Oficial Mexicana)
- Consultar aranceles aplicables en el Sistema Armonizado
- Revisar tratados comerciales vigentes

**Recomendación:** Consultar con un agente aduanal para casos específicos."""
            },
            {
                "input": "¿Cuáles son los aranceles para productos textiles?",
                "output": """**Aranceles para Productos Textiles:**

**Clasificación HS:** Capítulo 50-63 (Textiles y confecciones)

**Aranceles generales:**
- Tejidos de algodón: 15-20%
- Tejidos sintéticos: 15-25%
- Confecciones: 20-30%
- Calzado: 15-25%

**Tratados comerciales aplicables:**
- T-MEC (USMCA): Reducción significativa para exportaciones a EU/Canadá
- TPP-11: Beneficios para exportaciones a países del Pacífico
- Alianza del Pacífico: Preferencias arancelarias

**Consideraciones especiales:**
- Verificar reglas de origen para aplicar preferencias
- Consultar cuotas y salvaguardas vigentes
- Revisar restricciones no arancelarias

**Recomendación:** Consultar el Sistema Armonizado actualizado para clasificación específica."""
            }
        ]
        
        # Ejemplos para consultas de procesos
        self.few_shot_examples['process_query'] = [
            {
                "input": "¿Cómo funciona el proceso de importación?",
                "output": """**Proceso de Importación - Guía Paso a Paso:**

**FASE 1: PREPARACIÓN (1-3 días)**
1. Obtener RFC y registro en el padrón de importadores
2. Contratar agente aduanal autorizado
3. Verificar permisos y regulaciones del producto
4. Preparar documentación requerida

**FASE 2: NEGOCIACIÓN (3-7 días)**
1. Negociar términos comerciales con proveedor
2. Establecer método de pago (carta de crédito, transferencia)
3. Coordinar términos de entrega (Incoterms)
4. Programar embarque

**FASE 3: EMBARQUE (5-15 días)**
1. Confirmar embarque con proveedor
2. Obtener documentos de transporte
3. Coordinar logística internacional
4. Monitorear tránsito

**FASE 4: ADUANA (1-3 días)**
1. Presentar pedimento de importación
2. Pagar aranceles e impuestos
3. Inspección aduanera (si aplica)
4. Liberación de mercancía

**FASE 5: ENTREGA (1-2 días)**
1. Coordinar transporte nacional
2. Entrega en destino final
3. Verificar mercancía
4. Cerrar operación

**Tiempo total estimado:** 15-30 días"""
            }
        ]
    
    def get_template(self, template_name: str, **kwargs) -> ChatPromptTemplate:
        """Obtener plantilla específica con variables"""
        if template_name not in self.templates:
            logger.warning(f"Plantilla {template_name} no encontrada, usando plantilla base")
            return self.templates['system_base']
        
        template = self.templates[template_name]
        
        # Aplicar variables si se proporcionan
        if kwargs:
            try:
                return template.partial(**kwargs)
            except Exception as e:
                logger.error(f"Error aplicando variables a plantilla {template_name}: {e}")
                return template
        
        return template
    
    def get_few_shot_template(self, template_name: str, **kwargs) -> FewShotPromptTemplate:
        """Obtener plantilla few-shot específica"""
        if template_name not in self.few_shot_examples:
            logger.warning(f"Ejemplos few-shot para {template_name} no encontrados")
            return None
        
        examples = self.few_shot_examples[template_name]
        
        # Crear plantilla de ejemplo
        example_prompt = PromptTemplate(
            input_variables=["input", "output"],
            template="Usuario: {input}\n\nAsistente: {output}"
        )
        
        # Crear plantilla few-shot
        few_shot_template = FewShotPromptTemplate(
            examples=examples,
            example_prompt=example_prompt,
            prefix="Eres un asistente especializado en comercio exterior para SIEM. Responde las siguientes consultas basándote en los ejemplos:\n\n",
            suffix="Usuario: {input}\n\nAsistente:",
            input_variables=["input"]
        )
        
        return few_shot_template
    
    def get_user_specific_template(self, user_type: str, current_page: str, **kwargs) -> ChatPromptTemplate:
        """Obtener plantilla específica para tipo de usuario y página"""
        
        # Plantilla base según tipo de usuario
        if user_type == "siem":
            base_template = self.templates['system_base']
            user_context = """
CONTEXTO ESPECÍFICO PARA USUARIO SIEM:
- Tienes acceso completo a todas las operaciones del sistema
- Puedes analizar datos agregados y tendencias
- Puedes generar reportes y análisis ejecutivos
- Puedes gestionar usuarios y configuraciones
- Tu enfoque es operacional y estratégico
"""
        else:  # cliente
            base_template = self.templates['system_base']
            user_context = """
CONTEXTO ESPECÍFICO PARA USUARIO CLIENTE:
- Tienes acceso limitado a tus propias operaciones
- Tu enfoque es en el seguimiento y estado de tus operaciones
- Puedes consultar información sobre tus clientes y proveedores
- Tu interfaz es simplificada y orientada a resultados
"""
        
        # Contexto específico por página
        page_context = self._get_page_context(current_page)
        
        # Combinar contextos
        full_context = f"{user_context}\n\n{page_context}"
        
        # Crear plantilla personalizada
        custom_template = ChatPromptTemplate.from_messages([
            ("system", f"{base_template.messages[0].prompt.template}\n\n{full_context}"),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        return custom_template
    
    def _get_page_context(self, current_page: str) -> str:
        """Obtener contexto específico según la página actual"""
        page_contexts = {
            "/operations": """
CONTEXTO DE PÁGINA - OPERACIONES:
- El usuario está viendo la lista de operaciones
- Puede consultar sobre estados, filtros, y análisis de operaciones
- Puede solicitar información sobre operaciones específicas
- Puede pedir reportes y estadísticas de operaciones
""",
            "/clients": """
CONTEXTO DE PÁGINA - CLIENTES:
- El usuario está gestionando información de clientes
- Puede consultar sobre datos de clientes, contactos, y historial
- Puede solicitar análisis de clientes y sus operaciones
- Puede pedir información sobre nuevos clientes o actualizaciones
""",
            "/suppliers": """
CONTEXTO DE PÁGINA - PROVEEDORES:
- El usuario está gestionando proveedores
- Puede consultar sobre datos de proveedores, países, y productos
- Puede solicitar información sobre regulaciones por país
- Puede pedir análisis de proveedores y sus rendimientos
""",
            "/customs": """
CONTEXTO DE PÁGINA - ADUANAS:
- El usuario está consultando información aduanera
- Puede consultar sobre procedimientos, requisitos, y regulaciones
- Puede solicitar información sobre aduanas específicas
- Puede pedir guías de procesos aduaneros
""",
            "/reporting": """
CONTEXTO DE PÁGINA - REPORTES:
- El usuario está generando o consultando reportes
- Puede solicitar análisis de datos y tendencias
- Puede pedir reportes personalizados y filtros
- Puede consultar sobre métricas y KPIs del sistema
"""
        }
        
        return page_contexts.get(current_page, """
CONTEXTO DE PÁGINA - GENERAL:
- El usuario está navegando por el sistema
- Puede hacer consultas generales sobre comercio exterior
- Puede solicitar ayuda con procesos y regulaciones
- Puede pedir información sobre funcionalidades del sistema
""")
    
    def format_prompt_with_context(self, template_name: str, input_text: str, 
                                 chat_history: List = None, **context_vars) -> str:
        """Formatear prompt con contexto completo"""
        try:
            # Obtener plantilla
            template = self.get_template(template_name, **context_vars)
            
            # Preparar variables
            variables = {
                "input": input_text,
                "chat_history": chat_history or [],
                **context_vars
            }
            
            # Formatear mensajes
            messages = template.format_messages(**variables)
            
            return messages
            
        except Exception as e:
            logger.error(f"Error formateando prompt: {e}")
            # Fallback a plantilla básica
            return [SystemMessage(content="Eres un asistente de comercio exterior."), 
                   HumanMessage(content=input_text)]

# Instancia global del gestor de plantillas
_template_manager = None

def get_prompt_templates() -> SIEMPromptTemplates:
    """Obtener instancia del gestor de plantillas"""
    global _template_manager
    if _template_manager is None:
        _template_manager = SIEMPromptTemplates()
    
    return _template_manager

