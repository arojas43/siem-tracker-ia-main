"""
Sistema de memoria robusto para el chatbot de SIEM
Integra diferentes tipos de memoria de LangChain para una gestión completa del contexto
"""

import os
import json
import sqlite3
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.memory import BaseMemory
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI
from langchain.memory import (
    ConversationBufferWindowMemory,
    ConversationSummaryMemory,
    ConversationEntityMemory,
    CombinedMemory,
    ConversationSummaryBufferMemory
)

logger = logging.getLogger(__name__)

@dataclass
class ConversationContext:
    """Contexto completo de una conversación"""
    session_id: str
    user_id: str
    user_type: str
    current_page: str
    created_at: str
    last_activity: str
    message_count: int
    entities: Dict[str, Any]
    summary: Optional[str] = None

class SIEMEntityMemory:
    """Memoria personalizada para entidades específicas de SIEM"""
    
    def __init__(self, db_path: str = "siem_memory.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Inicializar base de datos SQLite para memoria"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Tabla para entidades de conversación
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS conversation_entities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    entity_type TEXT NOT NULL,
                    entity_name TEXT NOT NULL,
                    entity_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Tabla para resúmenes de conversación
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS conversation_summaries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    message_count INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Tabla para contexto de sesión
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS session_context (
                    session_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    user_type TEXT NOT NULL,
                    current_page TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    message_count INTEGER DEFAULT 0,
                    context_data TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Base de datos de memoria inicializada correctamente")
            
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
    
    def save_entity(self, session_id: str, entity_type: str, entity_name: str, entity_data: Dict[str, Any]):
        """Guardar entidad en la memoria"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verificar si la entidad ya existe
            cursor.execute('''
                SELECT id FROM conversation_entities 
                WHERE session_id = ? AND entity_type = ? AND entity_name = ?
            ''', (session_id, entity_type, entity_name))
            
            existing = cursor.fetchone()
            
            if existing:
                # Actualizar entidad existente
                cursor.execute('''
                    UPDATE conversation_entities 
                    SET entity_data = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (json.dumps(entity_data), existing[0]))
            else:
                # Crear nueva entidad
                cursor.execute('''
                    INSERT INTO conversation_entities 
                    (session_id, entity_type, entity_name, entity_data)
                    VALUES (?, ?, ?, ?)
                ''', (session_id, entity_type, entity_name, json.dumps(entity_data)))
            
            conn.commit()
            conn.close()
            logger.debug(f"Entidad guardada: {entity_type}:{entity_name}")
            
        except Exception as e:
            logger.error(f"Error guardando entidad: {e}")
    
    def get_entities(self, session_id: str, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Obtener entidades de una sesión"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if entity_type:
                cursor.execute('''
                    SELECT entity_type, entity_name, entity_data, updated_at
                    FROM conversation_entities 
                    WHERE session_id = ? AND entity_type = ?
                    ORDER BY updated_at DESC
                ''', (session_id, entity_type))
            else:
                cursor.execute('''
                    SELECT entity_type, entity_name, entity_data, updated_at
                    FROM conversation_entities 
                    WHERE session_id = ?
                    ORDER BY updated_at DESC
                ''', (session_id,))
            
            entities = []
            for row in cursor.fetchall():
                entities.append({
                    'type': row[0],
                    'name': row[1],
                    'data': json.loads(row[2]),
                    'updated_at': row[3]
                })
            
            conn.close()
            return entities
            
        except Exception as e:
            logger.error(f"Error obteniendo entidades: {e}")
            return []
    
    def save_summary(self, session_id: str, summary: str, message_count: int):
        """Guardar resumen de conversación"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO conversation_summaries 
                (session_id, summary, message_count)
                VALUES (?, ?, ?)
            ''', (session_id, summary, message_count))
            
            conn.commit()
            conn.close()
            logger.debug(f"Resumen guardado para sesión: {session_id}")
            
        except Exception as e:
            logger.error(f"Error guardando resumen: {e}")
    
    def get_summary(self, session_id: str) -> Optional[str]:
        """Obtener último resumen de conversación"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT summary FROM conversation_summaries 
                WHERE session_id = ?
                ORDER BY created_at DESC
                LIMIT 1
            ''', (session_id,))
            
            result = cursor.fetchone()
            conn.close()
            
            return result[0] if result else None
            
        except Exception as e:
            logger.error(f"Error obteniendo resumen: {e}")
            return None
    
    def save_session_context(self, context: ConversationContext):
        """Guardar contexto de sesión"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO session_context 
                (session_id, user_id, user_type, current_page, last_activity, message_count, context_data)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                context.session_id,
                context.user_id,
                context.user_type,
                context.current_page,
                context.last_activity,
                context.message_count,
                json.dumps({
                    'entities': context.entities,
                    'summary': context.summary
                })
            ))
            
            conn.commit()
            conn.close()
            logger.debug(f"Contexto de sesión guardado: {context.session_id}")
            
        except Exception as e:
            logger.error(f"Error guardando contexto de sesión: {e}")
    
    def get_session_context(self, session_id: str) -> Optional[ConversationContext]:
        """Obtener contexto de sesión"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT user_id, user_type, current_page, created_at, last_activity, message_count, context_data
                FROM session_context 
                WHERE session_id = ?
            ''', (session_id,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                context_data = json.loads(result[6]) if result[6] else {}
                return ConversationContext(
                    session_id=session_id,
                    user_id=result[0],
                    user_type=result[1],
                    current_page=result[2],
                    created_at=result[3],
                    last_activity=result[4],
                    message_count=result[5],
                    entities=context_data.get('entities', {}),
                    summary=context_data.get('summary')
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Error obteniendo contexto de sesión: {e}")
            return None

class SIEMMemoryManager:
    """Gestor de memoria robusto para el chatbot de SIEM"""
    
    def __init__(self, llm: ChatOpenAI, db_path: str = "siem_memory.db"):
        self.llm = llm
        self.entity_memory = SIEMEntityMemory(db_path)
        
        # Configurar diferentes tipos de memoria
        self._setup_memories()
        
        # Memoria combinada
        self.combined_memory = CombinedMemory(
            memories=[
                self.buffer_memory,
                self.summary_memory,
                self.entity_memory_langchain
            ]
        )
    
    def _setup_memories(self):
        """Configurar diferentes tipos de memoria"""
        
        # Memoria de buffer con ventana deslizante (últimos 10 mensajes)
        self.buffer_memory = ConversationBufferWindowMemory(
            k=10,
            return_messages=True,
            memory_key="chat_history",
            input_key="input",
            output_key="output"
        )
        
        # Memoria de resumen para conversaciones largas
        self.summary_memory = ConversationSummaryMemory(
            llm=self.llm,
            memory_key="conversation_summary",
            return_messages=True,
            input_key="input",
            output_key="output"
        )
        
        # Memoria de entidades personalizada
        self.entity_memory_langchain = ConversationEntityMemory(
            llm=self.llm,
            memory_key="entity_memory",
            return_messages=True,
            input_key="input",
            output_key="output"
        )
        
        # Memoria combinada
        self.combined_memory = CombinedMemory(
            memories=[
                self.buffer_memory,
                self.summary_memory,
                self.entity_memory_langchain
            ]
        )
    
    def save_conversation_context(self, session_id: str, user_id: str, user_type: str, 
                                current_page: str, messages: List[BaseMessage]):
        """Guardar contexto completo de la conversación"""
        try:
            # Extraer entidades de los mensajes
            entities = self._extract_entities_from_messages(messages)
            
            # Crear contexto
            context = ConversationContext(
                session_id=session_id,
                user_id=user_id,
                user_type=user_type,
                current_page=current_page,
                created_at=datetime.now().isoformat(),
                last_activity=datetime.now().isoformat(),
                message_count=len(messages),
                entities=entities
            )
            
            # Guardar en base de datos
            self.entity_memory.save_session_context(context)
            
            # Guardar entidades específicas
            for entity_type, entity_data in entities.items():
                for entity_name, data in entity_data.items():
                    self.entity_memory.save_entity(session_id, entity_type, entity_name, data)
            
            logger.info(f"Contexto de conversación guardado: {session_id}")
            
        except Exception as e:
            logger.error(f"Error guardando contexto de conversación: {e}")
    
    def _extract_entities_from_messages(self, messages: List[BaseMessage]) -> Dict[str, Dict[str, Any]]:
        """Extraer entidades relevantes de los mensajes"""
        entities = {
            'operations': {},
            'clients': {},
            'suppliers': {},
            'customs': {},
            'tasks': {}
        }
        
        for message in messages:
            content = message.content if hasattr(message, 'content') else str(message)
            
            # Buscar códigos de operación (formato SODXX-XXX)
            import re
            operation_codes = re.findall(r'SOD\d{2}-\d{3}', content)
            for code in operation_codes:
                entities['operations'][code] = {
                    'code': code,
                    'mentioned_at': datetime.now().isoformat(),
                    'context': content[:100]  # Primeros 100 caracteres del contexto
                }
            
            # Buscar nombres de clientes (palabras que empiecen con mayúscula)
            client_names = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', content)
            for name in client_names[:3]:  # Limitar a 3 nombres por mensaje
                if len(name) > 3:  # Filtrar palabras muy cortas
                    entities['clients'][name] = {
                        'name': name,
                        'mentioned_at': datetime.now().isoformat(),
                        'context': content[:100]
                    }
        
        return entities
    
    def get_conversation_context(self, session_id: str) -> Optional[ConversationContext]:
        """Obtener contexto de conversación"""
        return self.entity_memory.get_session_context(session_id)
    
    def get_entities_for_context(self, session_id: str) -> str:
        """Obtener entidades formateadas para contexto"""
        entities = self.entity_memory.get_entities(session_id)
        
        if not entities:
            return ""
        
        context_parts = []
        for entity in entities:
            context_parts.append(f"- {entity['type']}: {entity['name']} - {entity['data']}")
        
        return "ENTIDADES MENCIONADAS EN LA CONVERSACIÓN:\n" + "\n".join(context_parts)
    
    def get_memory_variables(self, session_id: str) -> Dict[str, Any]:
        """Obtener variables de memoria para el prompt"""
        context = self.get_conversation_context(session_id)
        entities_context = self.get_entities_for_context(session_id)
        
        return {
            'session_id': session_id,
            'user_context': context,
            'entities_context': entities_context,
            'conversation_summary': self.entity_memory.get_summary(session_id) or ""
        }
    
    def update_memory_with_messages(self, session_id: str, messages: List[BaseMessage]):
        """Actualizar memoria con nuevos mensajes"""
        try:
            # Actualizar memoria de buffer
            for message in messages:
                if isinstance(message, HumanMessage):
                    self.buffer_memory.chat_memory.add_user_message(message.content)
                elif isinstance(message, AIMessage):
                    self.buffer_memory.chat_memory.add_ai_message(message.content)
            
            # Generar resumen si hay muchos mensajes
            if len(messages) > 20:
                summary = self._generate_conversation_summary(messages)
                self.entity_memory.save_summary(session_id, summary, len(messages))
            
            logger.debug(f"Memoria actualizada para sesión: {session_id}")
            
        except Exception as e:
            logger.error(f"Error actualizando memoria: {e}")
    
    def _generate_conversation_summary(self, messages: List[BaseMessage]) -> str:
        """Generar resumen de la conversación"""
        try:
            # Tomar los últimos 10 mensajes para el resumen
            recent_messages = messages[-10:] if len(messages) > 10 else messages
            
            # Crear prompt para resumen
            conversation_text = "\n".join([
                f"{'Usuario' if isinstance(msg, HumanMessage) else 'Asistente'}: {msg.content}"
                for msg in recent_messages
            ])
            
            summary_prompt = f"""
            Resumen la siguiente conversación sobre comercio exterior y operaciones de SIEM.
            Enfócate en los puntos clave, operaciones mencionadas, y decisiones tomadas.
            
            Conversación:
            {conversation_text}
            
            Resumen:
            """
            
            # Generar resumen con el LLM
            response = self.llm.invoke([SystemMessage(content=summary_prompt)])
            return response.content if hasattr(response, 'content') else str(response)
            
        except Exception as e:
            logger.error(f"Error generando resumen: {e}")
            return "Resumen no disponible"

# Instancia global del gestor de memoria
_memory_manager = None

def get_memory_manager(llm: ChatOpenAI = None) -> SIEMMemoryManager:
    """Obtener instancia del gestor de memoria"""
    global _memory_manager
    if _memory_manager is None:
        if llm is None:
            # Crear LLM por defecto
            llm = ChatOpenAI(
                model=os.getenv('LM_STUDIO_MODEL', 'openai/gpt-oss-20b'),
                temperature=0.7,
                openai_api_key="dummy",
                openai_api_base=f"{os.getenv('LM_STUDIO_URL', 'http://localhost:1234')}/v1/"
            )
        
        _memory_manager = SIEMMemoryManager(llm)
    
    return _memory_manager
