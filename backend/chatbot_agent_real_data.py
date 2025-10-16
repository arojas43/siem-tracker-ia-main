"""
Agente de chatbot especializado en comercio exterior con datos reales de SIEM
"""

import os
import asyncio
import requests
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, BaseMessage
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda

logger = logging.getLogger(__name__)

@dataclass
class UserContext:
    user_id: str
    user_type: str
    current_page: str
    session_id: str

@dataclass
class ChatResponse:
    response: str
    confidence: float
    sources: List[str]
    suggested_actions: List[str]
    model_used: str
    timestamp: str
    session_id: str

class SIEMDataRetriever:
    """Clase para obtener datos reales del sistema SIEM"""
    
    def __init__(self, base_url: str, api_token: str):
        self.base_url = base_url
        self.api_token = api_token
        self.headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
        # URL del backend real de SIEM
        self.siem_backend_url = "https://dev-siem-tracker-backend-935390491354.us-central1.run.app/api"
        self._auth_token = None
        self._token_expiry = None
    
    async def _get_auth_session(self) -> requests.Session:
        """Obtener sesión autenticada del backend real"""
        try:
            # Si ya tenemos una sesión válida, usarla
            if hasattr(self, '_auth_session') and self._auth_session and self._token_expiry and datetime.now() < self._token_expiry:
                return self._auth_session
            
            # Crear nueva sesión
            session = requests.Session()
            
            # Usar las cookies que funcionaron en el curl
            # Estas cookies permiten acceso directo a los endpoints
            session.cookies.set('sessionid', 'bvrlbhka915u4gav0fr7u0ixgg9iq6ao')
            session.cookies.set('csrftoken', 'L5Ypbk5doh15jyem8GirJ3lmn2sxb4X3')
            
            # Verificar que la sesión funciona probando el endpoint de operaciones
            test_response = session.get(f"{self.siem_backend_url}/operations/", timeout=10)
            
            if test_response.status_code == 200:
                self._auth_session = session
                # Sesión válida por 1 hora
                self._token_expiry = datetime.now().replace(microsecond=0) + timedelta(hours=1)
                logger.info("Sesión autenticada creada exitosamente")
                return session
            else:
                logger.warning(f"Error verificando sesión: {test_response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error obteniendo sesión: {e}")
            return None
    
    async def get_user_operations(self, user_id: str, user_type: str) -> List[Dict]:
        """Obtener TODAS las operaciones del usuario desde el backend real de SIEM"""
        try:
            session = await self._get_auth_session()
            if not session:
                return []
            
            all_operations = []
            next_url = None
            total_count = 0
            
            # Primera petición
            if user_type == 'client':
                next_url = f"{self.siem_backend_url}/operations/?client_id={user_id}"
            else:
                next_url = f"{self.siem_backend_url}/operations/"
            
            page = 1
            max_pages = 20  # Límite de seguridad para evitar bucles infinitos
            
            while next_url and page <= max_pages:
                logger.info(f"Obteniendo página {page} de operaciones...")
                response = session.get(next_url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, dict):
                        # Obtener el total en la primera página
                        if page == 1:
                            total_count = data.get('count', 0)
                            logger.info(f"Total de operaciones en el sistema: {total_count}")
                        
                        # Agregar operaciones de esta página
                        page_operations = data.get('results', [])
                        all_operations.extend(page_operations)
                        logger.info(f"Página {page}: {len(page_operations)} operaciones obtenidas")
                        
                        # Obtener URL de la siguiente página
                        next_url = data.get('next')
                        if not next_url:
                            logger.info("No hay más páginas disponibles")
                            break
                    else:
                        break
                else:
                    logger.warning(f"Error obteniendo página {page}: {response.status_code}")
                    break
                
                page += 1
            
            logger.info(f"Total de operaciones obtenidas: {len(all_operations)} de {total_count}")
            
            return {
                'total_count': total_count,
                'results': all_operations,
                'pages_obtained': page - 1
            }
            
        except Exception as e:
            logger.error(f"Error en get_user_operations: {e}")
            return []
    
    async def get_user_tasks(self, user_id: str) -> List[Dict]:
        """Obtener tareas del usuario desde el backend real de SIEM"""
        try:
            session = await self._get_auth_session()
            if not session:
                return []
            
            response = session.get(
                f"{self.siem_backend_url}/tasks/",
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
        """Obtener clientes del usuario desde el backend real de SIEM"""
        try:
            session = await self._get_auth_session()
            if not session:
                return []
            
            response = session.get(
                f"{self.siem_backend_url}/clients/",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('results', []) if isinstance(data, dict) else data
            return []
        except Exception as e:
            logger.error(f"Error obteniendo clientes: {e}")
            return []
    
    async def get_user_suppliers(self, user_id: str) -> List[Dict]:
        """Obtener proveedores del usuario desde el backend real de SIEM"""
        try:
            session = await self._get_auth_session()
            if not session:
                return []
            
            response = session.get(
                f"{self.siem_backend_url}/goods_suppliers/",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('results', []) if isinstance(data, dict) else data
            return []
        except Exception as e:
            logger.error(f"Error obteniendo proveedores: {e}")
            return []
    
    async def get_user_customs(self, user_id: str) -> List[Dict]:
        """Obtener aduanas del usuario desde el backend real de SIEM"""
        try:
            session = await self._get_auth_session()
            if not session:
                return []
            
            response = session.get(
                f"{self.siem_backend_url}/customs/",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('results', []) if isinstance(data, dict) else data
            return []
        except Exception as e:
            logger.error(f"Error obteniendo aduanas: {e}")
            return []

class ComercioExteriorAgent:
    """Agente especializado en comercio exterior y aduanas con datos reales"""
    
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
        """Obtener datos contextuales del usuario desde el backend real"""
        if not user_context:
            return ""
        
        try:
            # Obtener datos en paralelo desde el backend real
            operations, tasks, clients, suppliers, customs = await asyncio.gather(
                self.data_retriever.get_user_operations(user_context.user_id, user_context.user_type),
                self.data_retriever.get_user_tasks(user_context.user_id),
                self.data_retriever.get_user_clients(user_context.user_id),
                self.data_retriever.get_user_suppliers(user_context.user_id),
                self.data_retriever.get_user_customs(user_context.user_id)
            )
            
            # Manejar el nuevo formato de operaciones
            if isinstance(operations, dict) and 'total_count' in operations:
                operations_count = operations['total_count']
                operations_list = operations['results']
            else:
                operations_count = len(operations) if operations else 0
                operations_list = operations
            
            # Determinar si tenemos acceso completo o parcial
            pages_obtained = operations.get('pages_obtained', 1) if isinstance(operations, dict) else 1
            has_complete_data = len(operations_list) == operations_count
            
            if has_complete_data:
                data_status = "✅ ACCESO COMPLETO"
                limitation_note = ""
            else:
                data_status = "⚠️ ACCESO PARCIAL"
                limitation_note = f"- Solo tengo acceso a {len(operations_list)} de {operations_count} operaciones totales\n- Páginas obtenidas: {pages_obtained}\n- Para análisis completos, consulta el sistema directamente"
            
            context = f"""
DATOS REALES DEL SISTEMA SIEM:

{data_status} A LOS DATOS

OPERACIONES:
- Total en el sistema: {operations_count}
- Datos disponibles: {len(operations_list)} operaciones
{limitation_note}
{self._format_operations_data(operations_list)}

TAREAS ({len(tasks)} encontradas):
{self._format_tasks_data(tasks)}

CLIENTES ({len(clients)} encontrados):
{self._format_clients_data(clients)}

PROVEEDORES ({len(suppliers)} encontrados):
{self._format_suppliers_data(suppliers)}

ADUANAS ({len(customs)} encontradas):
{self._format_customs_data(customs)}

CONTEXTO DEL USUARIO:
- ID: {user_context.user_id}
- Tipo: {user_context.user_type}
- Página actual: {user_context.current_page}
- Sesión: {user_context.session_id}
"""
            return context
            
        except Exception as e:
            logger.error(f"Error obteniendo contexto: {e}")
            return ""
    
    def _format_operations_data(self, operations: List[Dict]) -> str:
        """Formatear datos de operaciones"""
        if not operations:
            return "No hay operaciones disponibles"
        
        # Si hay muchas operaciones, mostrar un resumen estadístico
        if len(operations) > 20:
            # Contar por estado
            status_counts = {}
            for op in operations:
                status = op.get('status', 'Unknown')
                status_counts[status] = status_counts.get(status, 0) + 1
            
            formatted = [f"**Resumen estadístico de {len(operations)} operaciones:**"]
            for status, count in sorted(status_counts.items()):
                percentage = (count / len(operations)) * 100
                formatted.append(f"- {status}: {count} operaciones ({percentage:.1f}%)")
            
            # Mostrar algunas operaciones de ejemplo
            formatted.append(f"\n**Ejemplos de operaciones:**")
            for op in operations[:5]:
                client_name = op.get('client_info', {}).get('client_name', 'N/A') if isinstance(op.get('client_info'), dict) else 'N/A'
                formatted.append(f"- {op.get('operation_code', 'N/A')}: {op.get('status', 'N/A')} - {client_name}")
            
            if len(operations) > 5:
                formatted.append(f"... y {len(operations) - 5} operaciones más")
        else:
            # Si son pocas operaciones, mostrarlas todas
            formatted = []
            for op in operations:
                client_name = op.get('client_info', {}).get('client_name', 'N/A') if isinstance(op.get('client_info'), dict) else 'N/A'
                formatted.append(f"- {op.get('operation_code', 'N/A')}: {op.get('status', 'N/A')} - {client_name}")
        
        return "\n".join(formatted)
    
    def _format_tasks_data(self, tasks: List[Dict]) -> str:
        """Formatear datos de tareas"""
        if not tasks:
            return "No hay tareas disponibles"
        
        formatted = []
        for task in tasks[:10]:  # Limitar a 10
            formatted.append(f"- {task.get('task_name', 'N/A')}: {task.get('status', 'N/A')}")
        return "\n".join(formatted)
    
    def _format_clients_data(self, clients: List[Dict]) -> str:
        """Formatear datos de clientes"""
        if not clients:
            return "No hay clientes disponibles"
        
        formatted = []
        for client in clients[:10]:  # Limitar a 10
            formatted.append(f"- {client.get('full_name', 'N/A')}: {client.get('address', 'N/A')}")
        return "\n".join(formatted)
    
    def _format_suppliers_data(self, suppliers: List[Dict]) -> str:
        """Formatear datos de proveedores"""
        if not suppliers:
            return "No hay proveedores disponibles"
        
        formatted = []
        for supplier in suppliers[:10]:  # Limitar a 10
            formatted.append(f"- {supplier.get('name', 'N/A')}: {supplier.get('country', 'N/A')}")
        return "\n".join(formatted)
    
    def _format_customs_data(self, customs: List[Dict]) -> str:
        """Formatear datos de aduanas"""
        if not customs:
            return "No hay aduanas disponibles"
        
        formatted = []
        for custom in customs[:10]:  # Limitar a 10
            formatted.append(f"- {custom.get('name', 'N/A')}: {custom.get('location', 'N/A')}")
        return "\n".join(formatted)
    
    def _format_messages_with_context(self, messages: List[Dict], context_data: str, user_context: Optional[UserContext]) -> List[BaseMessage]:
        """Formatear mensajes con contexto del sistema"""
        formatted_messages = []
        
        # Agregar mensaje del sistema con contexto
        system_content = f"{self.system_prompt}\n\n{context_data}"
        formatted_messages.append(SystemMessage(content=system_content))
        
        # Agregar mensajes de la conversación
        for msg in messages:
            if msg.get('role') == 'user':
                formatted_messages.append(HumanMessage(content=msg.get('content', '')))
            elif msg.get('role') == 'assistant':
                formatted_messages.append(AIMessage(content=msg.get('content', '')))
        
        return formatted_messages
    
    async def process_chat(self, messages: List[Dict], user_context: Optional[UserContext] = None) -> ChatResponse:
        """Procesar chat con el agente usando datos reales"""
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
                model_used="error",
                timestamp=datetime.now().isoformat(),
                session_id=f"session_error_{int(datetime.now().timestamp())}"
            )
    
    def _detect_query_type(self, message: str) -> str:
        """Detectar tipo de consulta"""
        message_lower = message.lower()
        
        data_keywords = ['operaciones', 'tareas', 'clientes', 'proveedores', 'aduanas', 'cuántas', 'cuántos', 'estado', 'listar', 'mostrar']
        regulation_keywords = ['regulación', 'norma', 'ley', 'requisito', 'documento', 'arancel', 'código hs']
        process_keywords = ['proceso', 'paso', 'cómo', 'procedimiento', 'flujo', 'workflow']
        
        if any(keyword in message_lower for keyword in data_keywords):
            return 'data_query'
        elif any(keyword in message_lower for keyword in regulation_keywords):
            return 'regulation_query'
        elif any(keyword in message_lower for keyword in process_keywords):
            return 'process_query'
        else:
            return 'general_query'
    
    async def _handle_data_query(self, messages: List[Dict], user_context: Optional[UserContext]) -> ChatResponse:
        """Manejar consultas de datos con información real"""
        try:
            # Obtener datos reales del contexto
            context_data = await self._get_context_data(user_context)
            
            # Formatear mensajes con contexto real
            formatted_messages = self._format_messages_with_context(messages, context_data, user_context)
            
            # Procesar con el LLM
            result = await self.llm.ainvoke(formatted_messages)
            
            # Convertir a string si es necesario
            if hasattr(result, 'content'):
                response_text = result.content
            else:
                response_text = str(result)
            
            return ChatResponse(
                response=response_text,
                confidence=0.9,
                sources=["Base de datos SIEM", "Datos en tiempo real"],
                suggested_actions=["Ver detalles completos", "Exportar datos", "Filtrar resultados"],
                model_used="gpt-4o-mini",
                timestamp=datetime.now().isoformat(),
                session_id=f"session_{user_context.user_id if user_context else 'unknown'}_{int(datetime.now().timestamp())}"
            )
        except Exception as e:
            logger.error(f"Error en consulta de datos: {e}")
            return ChatResponse(
                response="No pude acceder a los datos del sistema en este momento.",
                confidence=0.0,
                sources=[],
                suggested_actions=[],
                model_used="error",
                timestamp=datetime.now().isoformat(),
                session_id=f"session_error_{int(datetime.now().timestamp())}"
            )
    
    async def _handle_regulation_query(self, messages: List[Dict]) -> ChatResponse:
        """Manejar consultas de regulaciones"""
        try:
            formatted_messages = self._format_messages_with_context(messages, "", None)
            result = await self.llm.ainvoke(formatted_messages)
            
            if hasattr(result, 'content'):
                response_text = result.content
            else:
                response_text = str(result)
            
            return ChatResponse(
                response=response_text,
                confidence=0.8,
                sources=["Normativas aduaneras", "Regulaciones internacionales"],
                suggested_actions=["Consultar documentación oficial", "Contactar especialista"],
                model_used="gpt-4o-mini",
                timestamp=datetime.now().isoformat(),
                session_id=f"session_unknown_{int(datetime.now().timestamp())}"
            )
        except Exception as e:
            logger.error(f"Error en consulta de regulaciones: {e}")
            return ChatResponse(
                response="No pude procesar tu consulta sobre regulaciones en este momento.",
                confidence=0.0,
                sources=[],
                suggested_actions=[],
                model_used="error",
                timestamp=datetime.now().isoformat(),
                session_id=f"session_error_{int(datetime.now().timestamp())}"
            )
    
    async def _handle_process_query(self, messages: List[Dict]) -> ChatResponse:
        """Manejar consultas de procesos"""
        try:
            formatted_messages = self._format_messages_with_context(messages, "", None)
            result = await self.llm.ainvoke(formatted_messages)
            
            if hasattr(result, 'content'):
                response_text = result.content
            else:
                response_text = str(result)
            
            return ChatResponse(
                response=response_text,
                confidence=0.8,
                sources=["Procesos SIEM", "Guías operativas"],
                suggested_actions=["Seguir proceso paso a paso", "Consultar documentación"],
                model_used="gpt-4o-mini",
                timestamp=datetime.now().isoformat(),
                session_id=f"session_unknown_{int(datetime.now().timestamp())}"
            )
        except Exception as e:
            logger.error(f"Error en consulta de procesos: {e}")
            return ChatResponse(
                response="No pude procesar tu consulta sobre procesos en este momento.",
                confidence=0.0,
                sources=[],
                suggested_actions=[],
                model_used="error",
                timestamp=datetime.now().isoformat(),
                session_id=f"session_error_{int(datetime.now().timestamp())}"
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
                model_used="gpt-4o-mini",
                timestamp=datetime.now().isoformat(),
                session_id=f"session_{user_context.user_id if user_context else 'unknown'}_{int(datetime.now().timestamp())}"
            )
        except Exception as e:
            logger.error(f"Error en consulta general: {e}")
            return ChatResponse(
                response="Lo siento, no pude procesar tu consulta en este momento.",
                confidence=0.0,
                sources=[],
                suggested_actions=[],
                model_used="error",
                timestamp=datetime.now().isoformat(),
                session_id=f"session_error_{int(datetime.now().timestamp())}"
            )

# Instancia global del agente
_agent_instance = None

def get_chatbot_agent() -> ComercioExteriorAgent:
    """Obtener instancia del agente con datos reales"""
    global _agent_instance
    if _agent_instance is None:
        siem_base_url = os.getenv('SIEM_API_BASE_URL', 'http://localhost:8000')
        siem_api_token = os.getenv('SIEM_API_TOKEN', 'dummy-token')
        
        _agent_instance = ComercioExteriorAgent(siem_base_url, siem_api_token)
    
    return _agent_instance
