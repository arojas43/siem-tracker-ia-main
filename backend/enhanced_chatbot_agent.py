"""
Agente de chatbot mejorado para SIEM con LangChain avanzado
Integra memoria robusta, plantillas dinámicas, output parsers y LCEL
"""

import os
import json
import asyncio
import logging
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from dataclasses import dataclass

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, BaseMessage
from langchain_core.runnables import RunnableLambda, RunnablePassthrough, RunnableParallel
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from memory_manager import get_memory_manager, ConversationContext
from prompt_templates import get_prompt_templates
from output_parsers import get_parser, parse_response
# RAG opcional: evitar fallo de import en entornos sin chroma/sentence-transformers
try:
    from rag.retriever import get_retriever, extract_sources, search_documents
except Exception:
    # Fallbacks mínimos para permitir que el backend funcione sin RAG
    def get_retriever(*args, **kwargs):
        return None
    def extract_sources(docs):
        return []
    def search_documents(query, metadata_filter=None, search_type=None, k=None):
        return []
from chatbot_agent_real_data import SIEMDataRetriever

logger = logging.getLogger(__name__)

@dataclass
class EnhancedUserContext:
    """Contexto extendido del usuario"""
    user_id: str
    user_type: str
    current_page: str
    session_id: str
    preferences: Optional[Dict[str, Any]] = None
    last_activity: Optional[str] = None

@dataclass
class EnhancedChatResponse:
    """Respuesta mejorada del chatbot"""
    response: str
    structured_data: Optional[Dict[str, Any]] = None
    confidence: float = 0.0
    sources: List[str] = None
    suggested_actions: List[str] = None
    follow_up_questions: List[str] = None
    model_used: str = ""
    timestamp: str = ""
    session_id: str = ""
    memory_used: bool = False
    entities_extracted: List[str] = None

class EnhancedSIEMChatbotAgent:
    """Agente de chatbot mejorado con funcionalidades avanzadas de LangChain"""
    
    def __init__(self, siem_base_url: str, siem_api_token: str):
        # Configurar LLM
        self.llm = self._setup_llm()
        
        # Inicializar componentes
        self.data_retriever = SIEMDataRetriever(siem_base_url, siem_api_token)
        self.memory_manager = get_memory_manager(self.llm)
        self.prompt_templates = get_prompt_templates()
        self.output_parser = StrOutputParser()
        # Inicializar RAG retriever
        try:
            self.retriever = get_retriever()
        except Exception as e:
            logger.warning(f"No se pudo inicializar el retriever RAG: {e}")
            self.retriever = None
        self._last_retrieved_sources: List[str] = []
        
        # Configurar cadenas LCEL
        self._setup_lcel_chains()
        
        logger.info("Agente mejorado de SIEM inicializado correctamente")
    
    def _setup_llm(self) -> ChatOpenAI:
        """Configurar LLM con parámetros optimizados"""
        lm_studio_url = os.getenv('LM_STUDIO_URL', 'http://localhost:1234')
        lm_studio_model = os.getenv('LM_STUDIO_MODEL', 'openai/gpt-oss-20b')
        
        return ChatOpenAI(
            model=lm_studio_model,
            temperature=0.7,
            max_tokens=3000,
            openai_api_key="dummy",
            openai_api_base=f"{lm_studio_url}/v1/"
        )
    
    def _setup_lcel_chains(self):
        """Configurar cadenas LCEL para diferentes tipos de consultas"""
        
        # Cadena para consultas de datos
        self.data_query_chain = (
            RunnableLambda(self._prepare_data_query)
            | RunnableLambda(self._format_data_prompt)
            | self.llm
            | RunnableLambda(self._parse_data_response)
        )
        
        # Cadena para consultas de regulaciones
        self.regulation_query_chain = (
            RunnableLambda(self._prepare_regulation_query)
            | RunnableLambda(self._format_regulation_prompt)
            | self.llm
            | RunnableLambda(self._parse_regulation_response)
        )
        
        # Cadena para consultas de procesos
        self.process_query_chain = (
            RunnableLambda(self._prepare_process_query)
            | RunnableLambda(self._format_process_prompt)
            | self.llm
            | RunnableLambda(self._parse_process_response)
        )
        
        # Cadena para consultas generales
        self.general_query_chain = (
            RunnableLambda(self._prepare_general_query)
            | RunnableLambda(self._format_general_prompt)
            | self.llm
            | RunnableLambda(self._parse_general_response)
        )
        
        # Cadena para análisis de operaciones
        self.operation_analysis_chain = (
            RunnableLambda(self._prepare_operation_analysis)
            | RunnableLambda(self._format_operation_prompt)
            | self.llm
            | RunnableLambda(self._parse_operation_response)
        )
    
    async def process_chat(self, messages: List[Dict], user_context: Optional[EnhancedUserContext] = None) -> EnhancedChatResponse:
        """Procesar chat con el agente mejorado"""
        try:
            logger.info(f"Procesando chat con {len(messages)} mensajes")
            
            # Crear contexto si no existe
            if not user_context:
                user_context = self._create_default_context()
            
            # Detectar tipo de consulta
            query_type = self._detect_query_type(messages[-1].get('content', '') if messages else '')
            logger.info(f"Tipo de consulta detectado: {query_type}")
            
            # Obtener contexto de memoria
            memory_context = self.memory_manager.get_memory_variables(user_context.session_id)
            
            # Preparar datos para la cadena
            chain_input = {
                'messages': messages,
                'user_context': user_context,
                'memory_context': memory_context,
                'query_type': query_type
            }
            
            # Procesar según el tipo de consulta
            if query_type == 'data_query':
                response = await self._handle_data_query(chain_input)
            elif query_type == 'regulation_query':
                response = await self._handle_regulation_query(chain_input)
            elif query_type == 'process_query':
                response = await self._handle_process_query(chain_input)
            elif query_type == 'operation_analysis':
                response = await self._handle_operation_analysis(chain_input)
            else:
                response = await self._handle_general_query(chain_input)
            
            # Actualizar memoria con la conversación
            self._update_memory_with_conversation(user_context, messages, response)
            
            logger.info(f"Respuesta generada exitosamente: {response.response[:100]}...")
            return response
            
        except Exception as e:
            logger.error(f"Error procesando chat: {e}", exc_info=True)
            return self._create_error_response(str(e), user_context)
    
    def _create_default_context(self) -> EnhancedUserContext:
        """Crear contexto por defecto"""
        return EnhancedUserContext(
            user_id="unknown",
            user_type="client",
            current_page="/",
            session_id=f"session_{int(datetime.now().timestamp())}",
            last_activity=datetime.now().isoformat()
        )
    
    def _detect_query_type(self, message: str) -> str:
        """Detectar tipo de consulta con mayor precisión"""
        message_lower = message.lower()
        
        # Palabras clave para análisis de operaciones (prioridad alta)
        operation_keywords = ['analizar operación', 'estado de operación', 'sod25-', 'operación específica', 'analiza', 'análisis de']
        if any(keyword in message_lower for keyword in operation_keywords):
            return 'operation_analysis'
        
        # Palabras clave para consultas de datos
        data_keywords = ['operaciones', 'tareas', 'clientes', 'proveedores', 'aduanas', 'cuántas', 'cuántos', 'estado', 'listar', 'mostrar', 'datos', 'estadísticas', 'total', 'cantidad', 'número de']
        if any(keyword in message_lower for keyword in data_keywords):
            return 'data_query'
        
        # Palabras clave para regulaciones
        regulation_keywords = ['regulación', 'norma', 'ley', 'requisito', 'documento', 'arancel', 'código hs', 'sat', 'permiso', 'licencia', 'importar', 'exportar', 'aduana']
        if any(keyword in message_lower for keyword in regulation_keywords):
            return 'regulation_query'
        
        # Palabras clave para consultas generales (saludos, preguntas básicas) - prioridad antes que procesos
        general_keywords = ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'cómo estás', 'qué tal', 'ayuda', 'información', 'explicar', 'contar', 'hablar', 'qué es', 'definir', 'concepto']
        if any(keyword in message_lower for keyword in general_keywords):
            return 'general_query'
        
        # Palabras clave para procesos (después de general para evitar conflictos)
        process_keywords = ['proceso', 'paso', 'procedimiento', 'flujo', 'workflow', 'etapa', 'fase', 'guía', 'hacer', 'realizar', 'ejecutar']
        if any(keyword in message_lower for keyword in process_keywords):
            return 'process_query'
        
        # Si no coincide con ningún patrón específico, es general
        return 'general_query'
    
    async def _handle_data_query(self, chain_input: Dict[str, Any]) -> EnhancedChatResponse:
        """Manejar consultas de datos con información real"""
        try:
            # Obtener datos reales del sistema
            user_context = chain_input['user_context']
            data_context = await self._get_real_data_context(user_context)
            
            # Preparar input para la cadena
            data_input = {
                **chain_input,
                'data_context': data_context,
                'entities_context': chain_input['memory_context'].get('entities_context', '')
            }
            
            # Ejecutar cadena de datos
            result = await self.data_query_chain.ainvoke(data_input)
            
            return result
            
        except Exception as e:
            logger.error(f"Error en consulta de datos: {e}")
            return self._create_error_response(f"Error accediendo a datos: {e}", chain_input['user_context'])
    
    async def _handle_regulation_query(self, chain_input: Dict[str, Any]) -> EnhancedChatResponse:
        """Manejar consultas de regulaciones"""
        try:
            # Recuperar contexto documental (RAG)
            query_text = chain_input['messages'][-1].get('content', '')
            chain_input['retrieved_context'] = self._retrieve_context(query_text, chain_input['user_context'])
            result = await self.regulation_query_chain.ainvoke(chain_input)
            return result
            
        except Exception as e:
            logger.error(f"Error en consulta de regulaciones: {e}")
            return self._create_error_response(f"Error procesando regulaciones: {e}", chain_input['user_context'])
    
    async def _handle_process_query(self, chain_input: Dict[str, Any]) -> EnhancedChatResponse:
        """Manejar consultas de procesos"""
        try:
            # Recuperar contexto documental (RAG)
            query_text = chain_input['messages'][-1].get('content', '')
            chain_input['retrieved_context'] = self._retrieve_context(query_text, chain_input['user_context'])
            result = await self.process_query_chain.ainvoke(chain_input)
            return result
            
        except Exception as e:
            logger.error(f"Error en consulta de procesos: {e}")
            return self._create_error_response(f"Error procesando procesos: {e}", chain_input['user_context'])
    
    async def _handle_operation_analysis(self, chain_input: Dict[str, Any]) -> EnhancedChatResponse:
        """Manejar análisis de operaciones específicas"""
        try:
            # Extraer código de operación del mensaje
            message = chain_input['messages'][-1].get('content', '')
            operation_code = self._extract_operation_code(message)
            
            if operation_code:
                # Obtener datos específicos de la operación
                operation_data = await self._get_operation_data(operation_code, chain_input['user_context'])
                chain_input['operation_data'] = operation_data
            # Recuperar contexto documental (RAG)
            chain_input['retrieved_context'] = self._retrieve_context(message, chain_input['user_context'])
            
            result = await self.operation_analysis_chain.ainvoke(chain_input)
            return result
            
        except Exception as e:
            logger.error(f"Error en análisis de operación: {e}")
            return self._create_error_response(f"Error analizando operación: {e}", chain_input['user_context'])
    
    async def _handle_general_query(self, chain_input: Dict[str, Any]) -> EnhancedChatResponse:
        """Manejar consultas generales"""
        try:
            # Recuperar contexto documental (RAG)
            query_text = chain_input['messages'][-1].get('content', '')
            chain_input['retrieved_context'] = self._retrieve_context(query_text, chain_input['user_context'])
            result = await self.general_query_chain.ainvoke(chain_input)
            return result
            
        except Exception as e:
            logger.error(f"Error en consulta general: {e}")
            return self._create_error_response(f"Error procesando consulta: {e}", chain_input['user_context'])
    
    # Métodos de preparación para las cadenas LCEL
    
    def _prepare_data_query(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preparar datos para consulta de datos"""
        return {
            'messages': input_data['messages'],
            'user_context': input_data['user_context'],
            'data_context': input_data.get('data_context', ''),
            'entities_context': input_data.get('entities_context', ''),
            'memory_context': input_data['memory_context']
        }
    
    def _prepare_regulation_query(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preparar datos para consulta de regulaciones"""
        return {
            'messages': input_data['messages'],
            'user_context': input_data['user_context'],
            'memory_context': input_data['memory_context']
        }
    
    def _prepare_process_query(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preparar datos para consulta de procesos"""
        return {
            'messages': input_data['messages'],
            'user_context': input_data['user_context'],
            'memory_context': input_data['memory_context']
        }
    
    def _prepare_general_query(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preparar datos para consulta general"""
        return {
            'messages': input_data['messages'],
            'user_context': input_data['user_context'],
            'memory_context': input_data['memory_context']
        }
    
    def _prepare_operation_analysis(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preparar datos para análisis de operación"""
        return {
            'messages': input_data['messages'],
            'user_context': input_data['user_context'],
            'operation_data': input_data.get('operation_data', {}),
            'memory_context': input_data['memory_context']
        }
    
    # Métodos de formateo de prompts
    def _build_preferences_message(self, user_context: EnhancedUserContext) -> Optional[SystemMessage]:
        """Construye un mensaje de sistema con preferencias/contexto del frontend para personalizar respuestas."""
        try:
            prefs = user_context.preferences or {}
            # Si no hay preferencias específicas, igual damos contexto breve del usuario
            summary = {
                "usuario_id": user_context.user_id,
                "tipo_usuario": user_context.user_type,
                "pagina_actual": user_context.current_page,
            }
            if prefs:
                summary["preferencias"] = prefs
            content = "PREFERENCIAS/CONTEXTO DEL USUARIO:\n" + json.dumps(summary, ensure_ascii=False, indent=2)
            return SystemMessage(content=content)
        except Exception:
            return None
    
    def _format_data_prompt(self, input_data: Dict[str, Any]) -> List[BaseMessage]:
        """Formatear prompt para consulta de datos"""
        template = self.prompt_templates.get_template(
            'data_query',
            data_context=input_data.get('data_context', ''),
            entities_context=input_data.get('entities_context', '')
        )
        
        # Convertir mensajes a formato LangChain
        chat_history = self._convert_messages_to_langchain(input_data['messages'][:-1])
        messages = template.format_messages(
            input=input_data['messages'][-1].get('content', ''),
            chat_history=chat_history
        )
        # Inyectar preferencias del usuario al inicio
        prefs_msg = self._build_preferences_message(input_data['user_context'])
        if prefs_msg:
            messages.insert(0, prefs_msg)
        return messages
    
    def _format_regulation_prompt(self, input_data: Dict[str, Any]) -> List[BaseMessage]:
        """Formatear prompt para consulta de regulaciones"""
        template = self.prompt_templates.get_template('regulation_query')
        
        chat_history = self._convert_messages_to_langchain(input_data['messages'][:-1])
        messages = template.format_messages(
            input=input_data['messages'][-1].get('content', ''),
            chat_history=chat_history
        )
        # Inyectar preferencias del usuario al inicio
        prefs_msg = self._build_preferences_message(input_data['user_context'])
        if prefs_msg:
            messages.insert(0, prefs_msg)
        # Añadir contexto recuperado si existe
        retrieved_context = input_data.get('retrieved_context')
        if retrieved_context:
            messages.insert(0, SystemMessage(content=f"DOCUMENTOS RELEVANTES (RAG):\n{retrieved_context}"))
        return messages
    
    def _format_process_prompt(self, input_data: Dict[str, Any]) -> List[BaseMessage]:
        """Formatear prompt para consulta de procesos"""
        template = self.prompt_templates.get_template('process_query')
        
        chat_history = self._convert_messages_to_langchain(input_data['messages'][:-1])
        messages = template.format_messages(
            input=input_data['messages'][-1].get('content', ''),
            chat_history=chat_history
        )
        # Inyectar preferencias del usuario al inicio
        prefs_msg = self._build_preferences_message(input_data['user_context'])
        if prefs_msg:
            messages.insert(0, prefs_msg)
        retrieved_context = input_data.get('retrieved_context')
        if retrieved_context:
            messages.insert(0, SystemMessage(content=f"DOCUMENTOS RELEVANTES (RAG):\n{retrieved_context}"))
        return messages
    
    def _format_general_prompt(self, input_data: Dict[str, Any]) -> List[BaseMessage]:
        """Formatear prompt para consulta general"""
        user_context = input_data['user_context']
        template = self.prompt_templates.get_user_specific_template(
            user_context.user_type,
            user_context.current_page
        )
        
        chat_history = self._convert_messages_to_langchain(input_data['messages'][:-1])
        messages = template.format_messages(
            input=input_data['messages'][-1].get('content', ''),
            chat_history=chat_history
        )
        # Inyectar preferencias del usuario al inicio
        prefs_msg = self._build_preferences_message(input_data['user_context'])
        if prefs_msg:
            messages.insert(0, prefs_msg)
        retrieved_context = input_data.get('retrieved_context')
        if retrieved_context:
            messages.insert(0, SystemMessage(content=f"DOCUMENTOS RELEVANTES (RAG):\n{retrieved_context}"))
        return messages
    
    def _format_operation_prompt(self, input_data: Dict[str, Any]) -> List[BaseMessage]:
        """Formatear prompt para análisis de operación"""
        template = self.prompt_templates.get_template(
            'operation_analysis',
            operation_data=input_data.get('operation_data', {}),
            additional_context=input_data.get('memory_context', {}).get('conversation_summary', '')
        )
        messages = template.format_messages(
            input=input_data['messages'][-1].get('content', ''),
            chat_history=self._convert_messages_to_langchain(input_data['messages'][:-1])
        )
        # Inyectar preferencias del usuario al inicio
        prefs_msg = self._build_preferences_message(input_data['user_context'])
        if prefs_msg:
            messages.insert(0, prefs_msg)
        retrieved_context = input_data.get('retrieved_context')
        if retrieved_context:
            messages.insert(0, SystemMessage(content=f"DOCUMENTOS RELEVANTES (RAG):\n{retrieved_context}"))
        return messages
        
        chat_history = self._convert_messages_to_langchain(input_data['messages'][:-1])
        messages = template.format_messages(
            input=input_data['messages'][-1].get('content', ''),
            chat_history=chat_history
        )
        retrieved_context = input_data.get('retrieved_context')
        if retrieved_context:
            messages.insert(0, SystemMessage(content=f"DOCUMENTOS RELEVANTES (RAG):\n{retrieved_context}"))
        return messages
    
    # Métodos de parsing de respuestas
    
    def _parse_data_response(self, response) -> EnhancedChatResponse:
        """Parsear respuesta de consulta de datos"""
        response_text = response.content if hasattr(response, 'content') else str(response)
        
        # Parsear con parser específico
        structured_data = parse_response(response_text, 'data_summary')
        
        sources = ["Base de datos SIEM", "Datos en tiempo real"]
        if getattr(self, "_last_retrieved_sources", None):
            sources = sources + self._last_retrieved_sources
        return EnhancedChatResponse(
            response=response_text,
            structured_data=structured_data,
            confidence=0.9,
            sources=sources,
            suggested_actions=["Ver detalles completos", "Exportar datos", "Filtrar resultados"],
            follow_up_questions=["¿Te gustaría analizar alguna operación específica?", "¿Necesitas más detalles sobre algún aspecto?"],
            model_used="gpt-4o-mini",
            timestamp=datetime.now().isoformat(),
            session_id="",
            memory_used=True,
            entities_extracted=self._extract_entities_from_response(response_text)
        )
    
    def _parse_regulation_response(self, response) -> EnhancedChatResponse:
        """Parsear respuesta de consulta de regulaciones"""
        response_text = response.content if hasattr(response, 'content') else str(response)
        
        structured_data = parse_response(response_text, 'regulation_info')
        
        sources = getattr(self, "_last_retrieved_sources", None) or ["Normativas aduaneras", "Regulaciones internacionales", "SAT"]
        return EnhancedChatResponse(
            response=response_text,
            structured_data=structured_data,
            confidence=0.8,
            sources=sources,
            suggested_actions=["Consultar documentación oficial", "Contactar especialista", "Verificar actualizaciones"],
            follow_up_questions=["¿Necesitas información sobre algún documento específico?", "¿Te interesa conocer las sanciones?"],
            model_used="gpt-4o-mini",
            timestamp=datetime.now().isoformat(),
            session_id="",
            memory_used=False
        )
    
    def _parse_process_response(self, response) -> EnhancedChatResponse:
        """Parsear respuesta de consulta de procesos"""
        response_text = response.content if hasattr(response, 'content') else str(response)
        
        structured_data = parse_response(response_text, 'process_steps')
        
        sources = getattr(self, "_last_retrieved_sources", None) or ["Procesos SIEM", "Guías operativas", "Mejores prácticas"]
        return EnhancedChatResponse(
            response=response_text,
            structured_data=structured_data,
            confidence=0.85,
            sources=sources,
            suggested_actions=["Seguir proceso paso a paso", "Consultar documentación", "Contactar soporte"],
            follow_up_questions=["¿Necesitas ayuda con algún paso específico?", "¿Te interesa conocer las mejores prácticas?"],
            model_used="gpt-4o-mini",
            timestamp=datetime.now().isoformat(),
            session_id="",
            memory_used=False
        )
    
    def _parse_general_response(self, response) -> EnhancedChatResponse:
        """Parsear respuesta de consulta general"""
        response_text = response.content if hasattr(response, 'content') else str(response)
        
        sources = getattr(self, "_last_retrieved_sources", None) or ["Base de conocimientos SIEM"]
        return EnhancedChatResponse(
            response=response_text,
            confidence=0.8,
            sources=sources,
            suggested_actions=["Hacer pregunta más específica", "Consultar documentación"],
            follow_up_questions=["¿Hay algo más en lo que pueda ayudarte?", "¿Te gustaría explorar alguna funcionalidad específica?"],
            model_used="gpt-4o-mini",
            timestamp=datetime.now().isoformat(),
            session_id="",
            memory_used=True
        )
    
    def _parse_operation_response(self, response) -> EnhancedChatResponse:
        """Parsear respuesta de análisis de operación"""
        response_text = response.content if hasattr(response, 'content') else str(response)
        
        structured_data = parse_response(response_text, 'operation_analysis')
        
        sources = getattr(self, "_last_retrieved_sources", None) or ["Datos de operación", "Sistema SIEM", "Análisis en tiempo real"]
        return EnhancedChatResponse(
            response=response_text,
            structured_data=structured_data,
            confidence=0.9,
            sources=sources,
            suggested_actions=["Revisar documentos pendientes", "Contactar cliente", "Actualizar estado"],
            follow_up_questions=["¿Necesitas ayuda con algún paso específico?", "¿Te interesa analizar otra operación?"],
            model_used="gpt-4o-mini",
            timestamp=datetime.now().isoformat(),
            session_id="",
            memory_used=True,
            entities_extracted=self._extract_entities_from_response(response_text)
        )
    
    # Métodos auxiliares
    
    def _convert_messages_to_langchain(self, messages: List[Dict]) -> List[BaseMessage]:
        """Convertir mensajes del formato API al formato LangChain"""
        langchain_messages = []
        
        for msg in messages:
            if msg.get('role') == 'user':
                langchain_messages.append(HumanMessage(content=msg.get('content', '')))
            elif msg.get('role') == 'assistant':
                langchain_messages.append(AIMessage(content=msg.get('content', '')))
        
        return langchain_messages
    
    async def _get_real_data_context(self, user_context: EnhancedUserContext) -> str:
        """Obtener contexto de datos reales del sistema"""
        try:
            # Obtener datos en paralelo
            operations, tasks, clients, suppliers, customs = await asyncio.gather(
                self.data_retriever.get_user_operations(user_context.user_id, user_context.user_type),
                self.data_retriever.get_user_tasks(user_context.user_id),
                self.data_retriever.get_user_clients(user_context.user_id),
                self.data_retriever.get_user_suppliers(user_context.user_id),
                self.data_retriever.get_user_customs(user_context.user_id)
            )
            
            # Formatear contexto
            context_parts = [
                f"OPERACIONES: {len(operations)} encontradas",
                f"TAREAS: {len(tasks)} encontradas",
                f"CLIENTES: {len(clients)} encontrados",
                f"PROVEEDORES: {len(suppliers)} encontrados",
                f"ADUANAS: {len(customs)} encontradas"
            ]
            
            return "\n".join(context_parts)
            
        except Exception as e:
            logger.error(f"Error obteniendo contexto de datos: {e}")
            return "Datos no disponibles temporalmente"
    
    def _extract_operation_code(self, message: str) -> Optional[str]:
        """Extraer código de operación del mensaje"""
        import re
        match = re.search(r'SOD\d{2}-\d{3}', message)
        return match.group() if match else None
    
    async def _get_operation_data(self, operation_code: str, user_context: EnhancedUserContext) -> Dict[str, Any]:
        """Obtener datos específicos de una operación"""
        try:
            # Aquí implementarías la lógica para obtener datos específicos de la operación
            # Por ahora, retornar datos mock
            return {
                'operation_code': operation_code,
                'status': 'En proceso',
                'client': 'Cliente Ejemplo',
                'created_date': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error obteniendo datos de operación: {e}")
            return {}
    
    def _extract_entities_from_response(self, response_text: str) -> List[str]:
        """Extraer entidades mencionadas en la respuesta"""
        import re
        
        entities = []
        
        # Buscar códigos de operación
        operation_codes = re.findall(r'SOD\d{2}-\d{3}', response_text)
        entities.extend(operation_codes)
        
        # Buscar nombres de clientes (palabras que empiecen con mayúscula)
        client_names = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', response_text)
        entities.extend(client_names[:3])  # Limitar a 3
        
        return entities

    def _retrieve_context(self, query_text: str, user_context: EnhancedUserContext) -> str:
        """Recuperar contexto documental vía RAG y devolver texto formateado.
        Actualiza self._last_retrieved_sources para adjuntarlas a la respuesta.
        """
        try:
            # Permite desactivar RAG temporalmente para pruebas sin vector store
            if os.getenv('DISABLE_RAG', '').lower() in ['1', 'true', 'yes']:
                self._last_retrieved_sources = []
                return ""
            if not getattr(self, 'retriever', None):
                self._last_retrieved_sources = []
                return ""
            # Construir filtro por usuario
            matrix_user_id = os.getenv('MATRIX_USER_ID', '')
            metadata_filter = None
            if not matrix_user_id or user_context.user_id != matrix_user_id:
                # Si no es el usuario matriz, solo ver global o sus docs
                # Chroma permite filtros OR mediante $or
                metadata_filter = {
                    "$or": [
                        {"visibility": "global"},
                        {"user_id": user_context.user_id}
                    ]
                }
            # Búsqueda con filtro dinámico
            docs = search_documents(query_text, metadata_filter=metadata_filter)
            self._last_retrieved_sources = extract_sources(docs)
            parts = []
            for d in docs[:4]:
                src = d.metadata.get("filename") or os.path.basename(d.metadata.get("source", ""))
                page = d.metadata.get("page")
                header = f"[{src} p.{page}]" if src and page is not None else (f"[{src}]" if src else "")
                parts.append(f"{header}\n{d.page_content}")
            return "\n\n".join(parts)
        except Exception as e:
            logger.warning(f"Fallo en recuperación RAG: {e}")
            self._last_retrieved_sources = []
            return ""
    
    def _update_memory_with_conversation(self, user_context: EnhancedUserContext, 
                                       messages: List[Dict], response: EnhancedChatResponse):
        """Actualizar memoria con la conversación"""
        try:
            # Convertir mensajes a formato LangChain
            langchain_messages = self._convert_messages_to_langchain(messages)
            
            # Agregar respuesta del asistente
            langchain_messages.append(AIMessage(content=response.response))
            
            # Guardar contexto de conversación
            self.memory_manager.save_conversation_context(
                user_context.session_id,
                user_context.user_id,
                user_context.user_type,
                user_context.current_page,
                langchain_messages
            )
            
            # Actualizar memoria con nuevos mensajes
            self.memory_manager.update_memory_with_messages(
                user_context.session_id,
                langchain_messages
            )
            
            logger.debug(f"Memoria actualizada para sesión: {user_context.session_id}")
            
        except Exception as e:
            logger.error(f"Error actualizando memoria: {e}")
    
    def _create_error_response(self, error_message: str, user_context: Optional[EnhancedUserContext]) -> EnhancedChatResponse:
        """Crear respuesta de error"""
        return EnhancedChatResponse(
            response=f"Lo siento, ocurrió un error al procesar tu consulta: {error_message}. Por favor, inténtalo de nuevo.",
            confidence=0.0,
            sources=[],
            suggested_actions=["Reintentar consulta", "Contactar soporte"],
            model_used="error",
            timestamp=datetime.now().isoformat(),
            session_id=user_context.session_id if user_context else "",
            memory_used=False
        )

# Instancia global del agente mejorado
_enhanced_agent_instance = None

def get_enhanced_chatbot_agent() -> EnhancedSIEMChatbotAgent:
    """Obtener instancia del agente mejorado"""
    global _enhanced_agent_instance
    if _enhanced_agent_instance is None:
        siem_base_url = os.getenv('SIEM_API_BASE_URL', 'http://localhost:8000')
        siem_api_token = os.getenv('SIEM_API_TOKEN', 'dummy-token')
        
        _enhanced_agent_instance = EnhancedSIEMChatbotAgent(siem_base_url, siem_api_token)
    
    return _enhanced_agent_instance
