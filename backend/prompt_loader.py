"""
Cargador de prompts para el chatbot de SIEM
"""

import os
from typing import Optional

def load_system_prompt(prompt_name: str) -> str:
    """
    Cargar un prompt del sistema desde archivos de texto
    
    Args:
        prompt_name: Nombre del prompt (sin extensión)
        
    Returns:
        Contenido del prompt como string
    """
    try:
        # Obtener el directorio actual del archivo
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompts_dir = os.path.join(current_dir, 'prompts')
        prompt_file = os.path.join(prompts_dir, f"{prompt_name}.txt")
        
        if not os.path.exists(prompt_file):
            # Si no existe el archivo específico, usar el prompt por defecto
            prompt_file = os.path.join(prompts_dir, "comercio_exterior_system_prompt.txt")
        
        if not os.path.exists(prompt_file):
            # Si tampoco existe el por defecto, usar un prompt básico
            return get_default_system_prompt()
        
        with open(prompt_file, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        return content
        
    except Exception as e:
        print(f"Error cargando prompt {prompt_name}: {e}")
        return get_default_system_prompt()

def get_default_system_prompt() -> str:
    """
    Obtener el prompt por defecto si no se puede cargar desde archivo
    """
    return """Eres un asistente especializado en comercio exterior y aduanas para SIEM (Sistema de Importación y Exportación de México). 

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

Responde en español y de manera útil y precisa."""

def get_agent_system_prompt(agent_id: str = "comercio_exterior") -> str:
    """
    Obtener el system prompt para un agente específico
    
    Args:
        agent_id: ID del agente (por defecto: comercio_exterior)
        
    Returns:
        System prompt del agente
    """
    return load_system_prompt(f"{agent_id}_system_prompt")

def get_few_shot_examples(agent_id: str = "comercio_exterior") -> str:
    """
    Obtener ejemplos few-shot para un agente específico
    
    Args:
        agent_id: ID del agente
        
    Returns:
        Ejemplos few-shot como string
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompts_dir = os.path.join(current_dir, 'prompts')
        examples_file = os.path.join(prompts_dir, f"{agent_id}_few_shot_examples.txt")
        
        if os.path.exists(examples_file):
            with open(examples_file, 'r', encoding='utf-8') as f:
                return f.read().strip()
        
        return ""
        
    except Exception as e:
        print(f"Error cargando ejemplos few-shot para {agent_id}: {e}")
        return ""

def get_prompt_template(template_name: str) -> str:
    """
    Obtener un template de prompt específico
    
    Args:
        template_name: Nombre del template
        
    Returns:
        Contenido del template
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompts_dir = os.path.join(current_dir, 'prompts')
        template_file = os.path.join(prompts_dir, f"{template_name}.txt")
        
        if os.path.exists(template_file):
            with open(template_file, 'r', encoding='utf-8') as f:
                return f.read().strip()
        
        return ""
        
    except Exception as e:
        print(f"Error cargando template {template_name}: {e}")
        return ""
