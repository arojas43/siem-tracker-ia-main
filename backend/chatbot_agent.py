"""
Agente de IA especializado en Comercio Exterior para SIEM
Basado en la arquitectura de AImas con LangChain y OpenAI
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import asyncio
from dataclasses import dataclass

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, BaseMessage
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
import requests

logger = logging.getLogger(__name__)

@dataclass
class UserContext:
    user_id: str
    user_type: str  # 'client' or 'siem'
    current_page: str
    session_id: str

@dataclass
class ChatResponse:
    response: str
    confidence: float
    sources: List[str]
    suggested_actions: List[str]
    model_used: str

class SIEMDataRetriever:
    """Clase para recuperar datos específicos de SIEM"""
    
    def __init__(self, base_url: str, api_token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
        # URL del backend real de SIEM
        self.siem_backend_url = "https://dev-siem-tracker-backend-935390491354.us-central1.run.app/api"
    
    async def get_user_operations(self, user_id: str, user_type: str) -> List[Dict]:
        """Obtener operaciones del usuario desde el backend real de SIEM"""
        try:
            # Autenticar primero para obtener el token
            auth_response = requests.post(f"{self.siem_backend_url}/auth/login", json={
                "email": "carlos.martinez@siem.business",
                "password": "Test4321"
            }, timeout=10)
            
            if auth_response.status_code != 200:
                logger.warning(f"Error autenticando: {auth_response.status_code}")
                return []
            
            auth_data = auth_response.json()
            token = auth_data.get('token')
            
            if not token:
                logger.warning("No se obtuvo token de autenticación")
                return []
            
            # Usar el token para consultar operaciones
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            if user_type == 'client':
                # Para clientes, obtener operaciones donde son el cliente
                response = requests.get(
                    f"{self.siem_backend_url}/operations/?client_id={user_id}",
                    headers=headers,
                    timeout=10
                )
            else:
                # Para SIEM, obtener todas las operaciones
                response = requests.get(
                    f"{self.siem_backend_url}/operations/",
                    headers=headers,
                    timeout=10
                )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('results', []) if isinstance(data, dict) else data
            else:
                logger.warning(f"Error obteniendo operaciones: {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error en get_user_operations: {e}")
            return []
    
    async def get_user_tasks(self, user_id: str) -> List[Dict]:
        """Obtener tareas del usuario desde el backend real de SIEM"""
        try:
            # Autenticar primero para obtener el token
            auth_response = requests.post(f"{self.siem_backend_url}/auth/login", json={
                "email": "carlos.martinez@siem.business",
                "password": "Test4321"
            }, timeout=10)
            
            if auth_response.status_code != 200:
                return []
            
            auth_data = auth_response.json()
            token = auth_data.get('token')
            
            if not token:
                return []
            
            # Usar el token para consultar tareas
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{self.siem_backend_url}/tasks/",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('results', []) if isinstance(data, dict) else data
            return []
        except Exception as e:
            logger.error(f"Error obteniendo tareas: {e}")
            return []
    
    async def get_user_clients(self, user_id: str) -> List[Dict]:
        """Obtener clientes del usuario"""
        try:
            url = f"{self.base_url}/api/clients/"
            response = requests.get(url, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return data.get('results', [])
            return []
        except Exception as e:
            logger.error(f"Error obteniendo clientes: {e}")
            return []
    
    async def get_user_suppliers(self, user_id: str) -> List[Dict]:
        """Obtener proveedores del usuario"""
        try:
            url = f"{self.base_url}/api/suppliers/"
            response = requests.get(url, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return data.get('results', [])
            return []
        except Exception as e:
            logger.error(f"Error obteniendo proveedores: {e}")
            return []
    
    async def get_user_customs(self, user_id: str) -> List[Dict]:
        """Obtener aduanas del usuario"""
        try:
            url = f"{self.base_url}/api/customs/"
            response = requests.get(url, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return data.get('results', [])
            return []
        except Exception as e:
            logger.error(f"Error obteniendo aduanas: {e}")
            return []

class ComercioExteriorAgent:
    """Agente especializado en comercio exterior y aduanas"""
    
    def __init__(self, siem_base_url: str, siem_api_token: str):
        # Configurar LLM para usar LM Studio
        lm_studio_url = os.getenv('LM_STUDIO_URL', 'http://localhost:1234')
        lm_studio_model = os.getenv('LM_STUDIO_MODEL', 'openai/gpt-oss-20b')
        
        self.llm = ChatOpenAI(
            model=lm_studio_model,
            temperature=0.7,
            max_tokens=2000,
            openai_api_key="dummy",  # LM Studio no requiere API key real
            openai_api_base=f"{lm_studio_url}/v1/"
        )
        self.data_retriever = SIEMDataRetriever(siem_base_url, siem_api_token)
        self.output_parser = StrOutputParser()
        self._setup_chains()
    
    def _setup_chains(self):
        """Configurar cadenas de procesamiento"""
        
        # Cargar system prompt desde archivo
        from prompt_loader import get_agent_system_prompt
        self.system_prompt = get_agent_system_prompt("comercio_exterior")

        # Cadena principal de chat - usando RunnableLambda correctamente
        from langchain_core.runnables import RunnableLambda
        
        self.chat_chain = (
            RunnableLambda(lambda x: self._format_messages_with_context(
                x["messages"], 
                "",
                x.get("user_context", None)
            ))
            | self.llm
            | self.output_parser
        )
    
    async def _get_context_data(self, user_context: Optional[UserContext]) -> str:
        """Obtener datos contextuales del usuario"""
        if not user_context:
            return ""
        
        try:
            # Obtener datos en paralelo
            operations, tasks, clients, suppliers, customs = await asyncio.gather(
                self.data_retriever.get_user_operations(user_context.user_id, user_context.user_type),
                self.data_retriever.get_user_tasks(user_context.user_id),
                self.data_retriever.get_user_clients(user_context.user_id),
                self.data_retriever.get_user_suppliers(user_context.user_id),
                self.data_retriever.get_user_customs(user_context.user_id)
            )
            
            context = f"""
CONTEXTO DEL USUARIO:
- Tipo de usuario: {user_context.user_type}
- Página actual: {user_context.current_page}
- ID de sesión: {user_context.session_id}

DATOS DISPONIBLES:

OPERACIONES ({len(operations)} encontradas):
{self._format_operations_data(operations[:5])}  # Mostrar solo las primeras 5

TAREAS ({len(tasks)} encontradas):
{self._format_tasks_data(tasks[:5])}

CLIENTES ({len(clients)} encontrados):
{self._format_clients_data(clients[:5])}

PROVEEDORES ({len(suppliers)} encontrados):
{self._format_suppliers_data(suppliers[:5])}

ADUANAS ({len(customs)} encontradas):
{self._format_customs_data(customs[:5])}
"""
            return context
        except Exception as e:
            logger.error(f"Error obteniendo contexto: {e}")
            return ""
    
    def _format_operations_data(self, operations: List[Dict]) -> str:
        """Formatear datos de operaciones"""
        if not operations:
            return "No hay operaciones disponibles"
        
        formatted = []
        for op in operations:
            formatted.append(f"- {op.get('operation_code', 'N/A')}: {op.get('status', 'N/A')} - {op.get('client_name', 'N/A')}")
        return "\n".join(formatted)
    
    def _format_tasks_data(self, tasks: List[Dict]) -> str:
        """Formatear datos de tareas"""
        if not tasks:
            return "No hay tareas disponibles"
        
        formatted = []
        for task in tasks:
            formatted.append(f"- {task.get('task_name', 'N/A')}: {task.get('status', 'N/A')}")
        return "\n".join(formatted)
    
    def _format_clients_data(self, clients: List[Dict]) -> str:
        """Formatear datos de clientes"""
        if not clients:
            return "No hay clientes disponibles"
        
        formatted = []
        for client in clients:
            formatted.append(f"- {client.get('full_name', 'N/A')}: {client.get('address', 'N/A')}")
        return "\n".join(formatted)
    
    def _format_suppliers_data(self, suppliers: List[Dict]) -> str:
        """Formatear datos de proveedores"""
        if not suppliers:
            return "No hay proveedores disponibles"
        
        formatted = []
        for supplier in suppliers:
            formatted.append(f"- {supplier.get('name', 'N/A')}: {supplier.get('country', 'N/A')}")
        return "\n".join(formatted)
    
    def _format_customs_data(self, customs: List[Dict]) -> str:
        """Formatear datos de aduanas"""
        if not customs:
            return "No hay aduanas disponibles"
        
        formatted = []
        for custom in customs:
            formatted.append(f"- {custom.get('name', 'N/A')}: {custom.get('location', 'N/A')}")
        return "\n".join(formatted)
    
    def _format_messages_with_context(self, messages: List[Dict], context_data: str, user_context: Optional[UserContext]) -> List[BaseMessage]:
        """Formatear mensajes con contexto"""
        formatted_messages = [SystemMessage(content=self.system_prompt)]
        
        if context_data:
            formatted_messages.append(SystemMessage(content=f"DATOS CONTEXTUALES:\n{context_data}"))
        
        # Convertir mensajes del usuario
        for msg in messages:
            if msg.get('role') == 'user':
                formatted_messages.append(HumanMessage(content=msg.get('content', '')))
            elif msg.get('role') == 'assistant':
                formatted_messages.append(AIMessage(content=msg.get('content', '')))
        
        return formatted_messages
    
    async def process_chat(self, messages: List[Dict], user_context: Optional[UserContext] = None) -> ChatResponse:
        """Procesar chat con el agente"""
        try:
            logger.info(f"Procesando chat con {len(messages)} mensajes")
            logger.info(f"Contexto de usuario: {user_context}")
            
            # Detectar tipo de consulta
            last_message = messages[-1].get('content', '') if messages else ''
            query_type = self._detect_query_type(last_message)
            logger.info(f"Tipo de consulta detectado: {query_type}")
            
            # Procesar según el tipo de consulta
            if query_type == 'data_query':
                logger.info("Procesando consulta de datos...")
                response = await self._handle_data_query(messages, user_context)
            elif query_type == 'regulation_query':
                logger.info("Procesando consulta de regulaciones...")
                response = await self._handle_regulation_query(messages)
            elif query_type == 'process_query':
                logger.info("Procesando consulta de procesos...")
                response = await self._handle_process_query(messages)
            else:
                logger.info("Procesando consulta general...")
                response = await self._handle_general_query(messages, user_context)
            
            logger.info(f"Respuesta generada: {response.response[:100]}...")
            return response
            
        except Exception as e:
            logger.error(f"Error procesando chat: {e}", exc_info=True)
            return ChatResponse(
                response="Lo siento, ocurrió un error al procesar tu consulta. Por favor, inténtalo de nuevo.",
                confidence=0.0,
                sources=[],
                suggested_actions=[],
                model_used="error"
            )
    
    def _detect_query_type(self, message: str) -> str:
        """Detectar tipo de consulta"""
        message_lower = message.lower()
        
        # Palabras clave para consultas de datos
        data_keywords = ['operaciones', 'tareas', 'clientes', 'proveedores', 'aduanas', 'estado', 'listar', 'mostrar', 'cuántas', 'cuántos']
        if any(keyword in message_lower for keyword in data_keywords):
            return 'data_query'
        
        # Palabras clave para regulaciones
        regulation_keywords = ['regulación', 'ley', 'norma', 'requisito', 'documento', 'permiso', 'licencia', 'arancel', 'código hs']
        if any(keyword in message_lower for keyword in regulation_keywords):
            return 'regulation_query'
        
        # Palabras clave para procesos
        process_keywords = ['proceso', 'paso', 'cómo', 'procedimiento', 'flujo', 'etapa', 'fase']
        if any(keyword in message_lower for keyword in process_keywords):
            return 'process_query'
        
        return 'general_query'
    
    async def _handle_data_query(self, messages: List[Dict], user_context: Optional[UserContext]) -> ChatResponse:
        """Manejar consultas sobre datos del sistema"""
        try:
            result = await self.chat_chain.ainvoke({
                "messages": messages,
                "user_context": user_context
            })
            
            return ChatResponse(
                response=result,
                confidence=0.9,
                sources=["Sistema SIEM"],
                suggested_actions=["Ver detalles completos", "Exportar datos", "Filtrar resultados"],
                model_used="gpt-4o-mini"
            )
        except Exception as e:
            logger.error(f"Error en consulta de datos: {e}")
            return ChatResponse(
                response="No pude acceder a los datos del sistema en este momento.",
                confidence=0.0,
                sources=[],
                suggested_actions=[],
                model_used="error"
            )
    
    async def _handle_regulation_query(self, messages: List[Dict]) -> ChatResponse:
        """Manejar consultas sobre regulaciones"""
        try:
            result = await self.chat_chain.ainvoke({
                "messages": messages,
                "user_context": None
            })
            
            return ChatResponse(
                response=result,
                confidence=0.8,
                sources=["Regulaciones aduaneras", "SAT", "OMC"],
                suggested_actions=["Consultar SAT", "Verificar actualizaciones", "Contactar especialista"],
                model_used="gpt-4o-mini"
            )
        except Exception as e:
            logger.error(f"Error en consulta de regulaciones: {e}")
            return ChatResponse(
                response="No pude acceder a la información regulatoria en este momento.",
                confidence=0.0,
                sources=[],
                suggested_actions=[],
                model_used="error"
            )
    
    async def _handle_process_query(self, messages: List[Dict]) -> ChatResponse:
        """Manejar consultas sobre procesos"""
        try:
            result = await self.chat_chain.ainvoke({
                "messages": messages,
                "user_context": None
            })
            
            return ChatResponse(
                response=result,
                confidence=0.85,
                sources=["Procesos SIEM", "Guías aduaneras"],
                suggested_actions=["Seguir proceso paso a paso", "Consultar documentación", "Contactar soporte"],
                model_used="gpt-4o-mini"
            )
        except Exception as e:
            logger.error(f"Error en consulta de procesos: {e}")
            return ChatResponse(
                response="No pude acceder a la información de procesos en este momento.",
                confidence=0.0,
                sources=[],
                suggested_actions=[],
                model_used="error"
            )
    
    async def _handle_general_query(self, messages: List[Dict], user_context: Optional[UserContext]) -> ChatResponse:
        """Manejar consultas generales"""
        try:
            # Formatear mensajes directamente
            formatted_messages = self._format_messages_with_context(messages, "", user_context)
            
            # Procesar con el LLM directamente
            result = await self.llm.ainvoke(formatted_messages)
            
            # Convertir a string si es necesario
            if hasattr(result, 'content'):
                response_text = result.content
            else:
                response_text = str(result)
            
            return ChatResponse(
                response=response_text,
                confidence=0.8,
                sources=["Base de conocimientos SIEM"],
                suggested_actions=["Hacer pregunta más específica", "Consultar documentación"],
                model_used="gpt-4o-mini"
            )
        except Exception as e:
            logger.error(f"Error en consulta general: {e}")
            return ChatResponse(
                response="Lo siento, no pude procesar tu consulta en este momento.",
                confidence=0.0,
                sources=[],
                suggested_actions=[],
                model_used="error"
            )

# Instancia global del agente
_agent_instance = None

def get_chatbot_agent() -> ComercioExteriorAgent:
    """Obtener instancia del agente"""
    global _agent_instance
    if _agent_instance is None:
        siem_base_url = os.getenv('SIEM_API_BASE_URL', 'http://localhost:8000')
        siem_api_token = os.getenv('SIEM_API_TOKEN', 'dummy-token')
        
        _agent_instance = ComercioExteriorAgent(siem_base_url, siem_api_token)
    
    return _agent_instance
