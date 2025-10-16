"""
Sistema de output parsers para el chatbot de SIEM
Incluye parsers JSON y personalizados para diferentes tipos de respuestas
"""

import json
import logging
import re
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from dataclasses import dataclass, asdict

from langchain_core.output_parsers import BaseOutputParser, JsonOutputParser
from langchain_core.messages import BaseMessage
from pydantic import BaseModel, Field, validator

logger = logging.getLogger(__name__)

# Modelos Pydantic para validación de respuestas estructuradas

class OperationAnalysis(BaseModel):
    """Modelo para análisis de operaciones"""
    operation_code: str = Field(description="Código de la operación")
    status: str = Field(description="Estado actual de la operación")
    priority: str = Field(description="Prioridad: alta, media, baja")
    next_steps: List[str] = Field(description="Próximos pasos recomendados")
    risks: List[str] = Field(description="Riesgos identificados")
    opportunities: List[str] = Field(description="Oportunidades identificadas")
    estimated_completion: Optional[str] = Field(description="Fecha estimada de finalización")
    confidence_score: float = Field(description="Nivel de confianza del análisis (0-1)")

class DataSummary(BaseModel):
    """Modelo para resúmenes de datos"""
    total_count: int = Field(description="Total de elementos")
    summary_by_category: Dict[str, int] = Field(description="Resumen por categoría")
    key_insights: List[str] = Field(description="Insights principales")
    recommendations: List[str] = Field(description="Recomendaciones")
    data_quality: str = Field(description="Calidad de los datos: excelente, buena, regular, pobre")
    limitations: List[str] = Field(description="Limitaciones identificadas")

class RegulationInfo(BaseModel):
    """Modelo para información regulatoria"""
    regulation_type: str = Field(description="Tipo de regulación")
    applicable_laws: List[str] = Field(description="Leyes aplicables")
    requirements: List[str] = Field(description="Requisitos específicos")
    documents_needed: List[str] = Field(description="Documentos requeridos")
    deadlines: List[str] = Field(description="Fechas límite importantes")
    penalties: List[str] = Field(description="Sanciones por incumplimiento")
    exceptions: List[str] = Field(description="Excepciones aplicables")

class ProcessStep(BaseModel):
    """Modelo para pasos de proceso"""
    step_number: int = Field(description="Número del paso")
    step_name: str = Field(description="Nombre del paso")
    description: str = Field(description="Descripción detallada")
    duration: str = Field(description="Duración estimada")
    responsible: str = Field(description="Responsable del paso")
    documents: List[str] = Field(description="Documentos requeridos")
    dependencies: List[str] = Field(description="Dependencias de otros pasos")
    critical: bool = Field(description="Si es un paso crítico")

class ChatResponse(BaseModel):
    """Modelo para respuestas de chat estructuradas"""
    response_type: str = Field(description="Tipo de respuesta: data, regulation, process, general")
    main_response: str = Field(description="Respuesta principal")
    structured_data: Optional[Dict[str, Any]] = Field(description="Datos estructurados")
    sources: List[str] = Field(description="Fuentes de información")
    suggested_actions: List[str] = Field(description="Acciones sugeridas")
    confidence: float = Field(description="Nivel de confianza (0-1)")
    follow_up_questions: List[str] = Field(description="Preguntas de seguimiento")

class SIEMOutputParser(BaseOutputParser):
    """Parser personalizado para respuestas del chatbot de SIEM.
    Evita atributos privados no declarados para compatibilidad con Pydantic.
    """

    # Definimos como campo permitido por Pydantic para evitar errores de asignación
    response_type: str = "general"

    def __init__(self, response_type: str = "general"):
        # Inicializar el BaseModel y luego asignar el campo permitido
        super().__init__()
        self.response_type = response_type

    def parse(self, text: str) -> Dict[str, Any]:
        """Parsear respuesta de texto a estructura JSON"""
        try:
            # Intentar extraer JSON del texto
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)

            # Si no hay JSON, crear estructura básica
            return self._create_basic_structure(text)

        except Exception as e:
            logger.error(f"Error parseando respuesta: {e}")
            return self._create_basic_structure(text)

    def _create_basic_structure(self, text: str) -> Dict[str, Any]:
        """Crear estructura básica cuando no se puede parsear JSON"""
        return {
            "response_type": self.response_type,
            "main_response": text,
            "structured_data": None,
            "sources": [],
            "suggested_actions": [],
            "confidence": 0.8,
            "follow_up_questions": []
        }

class OperationAnalysisParser(BaseOutputParser):
    """Parser específico para análisis de operaciones"""
    
    def parse(self, text: str) -> OperationAnalysis:
        """Parsear análisis de operación"""
        try:
            # Extraer información usando regex
            operation_code = self._extract_operation_code(text)
            status = self._extract_status(text)
            priority = self._extract_priority(text)
            next_steps = self._extract_next_steps(text)
            risks = self._extract_risks(text)
            opportunities = self._extract_opportunities(text)
            estimated_completion = self._extract_completion_date(text)
            confidence_score = self._extract_confidence(text)
            
            return OperationAnalysis(
                operation_code=operation_code,
                status=status,
                priority=priority,
                next_steps=next_steps,
                risks=risks,
                opportunities=opportunities,
                estimated_completion=estimated_completion,
                confidence_score=confidence_score
            )
            
        except Exception as e:
            logger.error(f"Error parseando análisis de operación: {e}")
            # Retornar análisis por defecto
            return OperationAnalysis(
                operation_code="N/A",
                status="Desconocido",
                priority="media",
                next_steps=["Revisar documentación"],
                risks=["Información limitada"],
                opportunities=[],
                estimated_completion=None,
                confidence_score=0.5
            )
    
    def _extract_operation_code(self, text: str) -> str:
        """Extraer código de operación"""
        match = re.search(r'SOD\d{2}-\d{3}', text)
        return match.group() if match else "N/A"
    
    def _extract_status(self, text: str) -> str:
        """Extraer estado de la operación"""
        status_keywords = {
            'en proceso': 'En proceso',
            'pendiente': 'Pendiente',
            'completada': 'Completada',
            'cancelada': 'Cancelada',
            'en revisión': 'En revisión'
        }
        
        text_lower = text.lower()
        for keyword, status in status_keywords.items():
            if keyword in text_lower:
                return status
        
        return "Desconocido"
    
    def _extract_priority(self, text: str) -> str:
        """Extraer prioridad"""
        text_lower = text.lower()
        if 'alta' in text_lower or 'urgente' in text_lower:
            return 'alta'
        elif 'baja' in text_lower:
            return 'baja'
        else:
            return 'media'
    
    def _extract_next_steps(self, text: str) -> List[str]:
        """Extraer próximos pasos"""
        steps = []
        # Buscar listas con viñetas o números
        step_patterns = [
            r'[•\-\*]\s*([^\.]+)',
            r'\d+\.\s*([^\.]+)',
            r'próximo[s]?\s*paso[s]?[:\-]?\s*([^\.]+)',
            r'siguiente[s]?\s*paso[s]?[:\-]?\s*([^\.]+)'
        ]
        
        for pattern in step_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            steps.extend([match.strip() for match in matches])
        
        return steps[:5]  # Limitar a 5 pasos
    
    def _extract_risks(self, text: str) -> List[str]:
        """Extraer riesgos identificados"""
        risks = []
        risk_keywords = ['riesgo', 'problema', 'dificultad', 'obstáculo', 'retraso']
        
        for keyword in risk_keywords:
            if keyword in text.lower():
                # Buscar contexto alrededor de la palabra clave
                pattern = rf'.{{0,50}}{keyword}.{{0,50}}'
                matches = re.findall(pattern, text, re.IGNORECASE)
                risks.extend(matches)
        
        return risks[:3]  # Limitar a 3 riesgos
    
    def _extract_opportunities(self, text: str) -> List[str]:
        """Extraer oportunidades identificadas"""
        opportunities = []
        opp_keywords = ['oportunidad', 'beneficio', 'ventaja', 'mejora', 'optimización']
        
        for keyword in opp_keywords:
            if keyword in text.lower():
                pattern = rf'.{{0,50}}{keyword}.{{0,50}}'
                matches = re.findall(pattern, text, re.IGNORECASE)
                opportunities.extend(matches)
        
        return opportunities[:3]  # Limitar a 3 oportunidades
    
    def _extract_completion_date(self, text: str) -> Optional[str]:
        """Extraer fecha estimada de finalización"""
        date_patterns = [
            r'(\d{1,2}/\d{1,2}/\d{4})',
            r'(\d{1,2}-\d{1,2}-\d{4})',
            r'(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})',
            r'(\d+\s+días?\s+hábiles?)',
            r'(\d+\s+semanas?)'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group()
        
        return None
    
    def _extract_confidence(self, text: str) -> float:
        """Extraer nivel de confianza"""
        confidence_keywords = {
            'muy confiado': 0.9,
            'confiado': 0.8,
            'moderadamente confiado': 0.7,
            'poco confiado': 0.5,
            'incierto': 0.3
        }
        
        text_lower = text.lower()
        for keyword, score in confidence_keywords.items():
            if keyword in text_lower:
                return score
        
        return 0.7  # Confianza por defecto

class DataSummaryParser(BaseOutputParser):
    """Parser para resúmenes de datos"""
    
    def parse(self, text: str) -> DataSummary:
        """Parsear resumen de datos"""
        try:
            total_count = self._extract_total_count(text)
            summary_by_category = self._extract_category_summary(text)
            key_insights = self._extract_insights(text)
            recommendations = self._extract_recommendations(text)
            data_quality = self._extract_data_quality(text)
            limitations = self._extract_limitations(text)
            
            return DataSummary(
                total_count=total_count,
                summary_by_category=summary_by_category,
                key_insights=key_insights,
                recommendations=recommendations,
                data_quality=data_quality,
                limitations=limitations
            )
            
        except Exception as e:
            logger.error(f"Error parseando resumen de datos: {e}")
            return DataSummary(
                total_count=0,
                summary_by_category={},
                key_insights=["Error en el análisis"],
                recommendations=["Revisar datos"],
                data_quality="pobre",
                limitations=["Error de procesamiento"]
            )
    
    def _extract_total_count(self, text: str) -> int:
        """Extraer total de elementos"""
        patterns = [
            r'total[:\s]+(\d+)',
            r'(\d+)\s+elementos?',
            r'(\d+)\s+operaciones?',
            r'(\d+)\s+registros?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return 0
    
    def _extract_category_summary(self, text: str) -> Dict[str, int]:
        """Extraer resumen por categoría"""
        categories = {}
        
        # Buscar patrones como "Categoría: X elementos"
        pattern = r'([^:]+):\s*(\d+)\s*(?:elementos?|operaciones?|registros?)'
        matches = re.findall(pattern, text, re.IGNORECASE)
        
        for category, count in matches:
            categories[category.strip()] = int(count)
        
        return categories
    
    def _extract_insights(self, text: str) -> List[str]:
        """Extraer insights principales"""
        insights = []
        
        # Buscar secciones de insights
        insight_patterns = [
            r'insights?[:\-]?\s*([^\.]+)',
            r'hallazgos?[:\-]?\s*([^\.]+)',
            r'conclusiones?[:\-]?\s*([^\.]+)'
        ]
        
        for pattern in insight_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            insights.extend([match.strip() for match in matches])
        
        return insights[:5]  # Limitar a 5 insights
    
    def _extract_recommendations(self, text: str) -> List[str]:
        """Extraer recomendaciones"""
        recommendations = []
        
        # Buscar secciones de recomendaciones
        rec_patterns = [
            r'recomendaciones?[:\-]?\s*([^\.]+)',
            r'sugerencias?[:\-]?\s*([^\.]+)',
            r'acciones?[:\-]?\s*([^\.]+)'
        ]
        
        for pattern in rec_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            recommendations.extend([match.strip() for match in matches])
        
        return recommendations[:5]  # Limitar a 5 recomendaciones
    
    def _extract_data_quality(self, text: str) -> str:
        """Extraer calidad de los datos"""
        quality_keywords = {
            'excelente': 'excelente',
            'muy buena': 'excelente',
            'buena': 'buena',
            'regular': 'regular',
            'pobre': 'pobre',
            'limitada': 'pobre'
        }
        
        text_lower = text.lower()
        for keyword, quality in quality_keywords.items():
            if keyword in text_lower:
                return quality
        
        return 'regular'  # Calidad por defecto
    
    def _extract_limitations(self, text: str) -> List[str]:
        """Extraer limitaciones"""
        limitations = []
        
        # Buscar secciones de limitaciones
        lim_patterns = [
            r'limitaciones?[:\-]?\s*([^\.]+)',
            r'restricciones?[:\-]?\s*([^\.]+)',
            r'consideraciones?[:\-]?\s*([^\.]+)'
        ]
        
        for pattern in lim_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            limitations.extend([match.strip() for match in matches])
        
        return limitations[:3]  # Limitar a 3 limitaciones

class SIEMParserFactory:
    """Factory para crear parsers específicos"""
    
    @staticmethod
    def get_parser(parser_type: str) -> BaseOutputParser:
        """Obtener parser específico según el tipo"""
        parsers = {
            'operation_analysis': OperationAnalysisParser(),
            'data_summary': DataSummaryParser(),
            'regulation_info': SIEMOutputParser('regulation'),
            'process_steps': SIEMOutputParser('process'),
            'general': SIEMOutputParser('general')
        }
        
        if parser_type not in parsers:
            logger.warning(f"Parser {parser_type} no encontrado, usando parser general")
            return SIEMOutputParser('general')
        
        return parsers[parser_type]
    
    @staticmethod
    def parse_response(text: str, response_type: str) -> Dict[str, Any]:
        """Parsear respuesta con el parser apropiado"""
        parser = SIEMParserFactory.get_parser(response_type)
        
        if hasattr(parser, 'parse') and callable(parser.parse):
            try:
                result = parser.parse(text)
                if hasattr(result, 'dict'):
                    return result.dict()
                elif hasattr(result, '__dict__'):
                    return result.__dict__
                else:
                    return result
            except Exception as e:
                logger.error(f"Error parseando con {response_type}: {e}")
                return {"error": str(e), "original_text": text}
        
        return {"error": "Parser no válido", "original_text": text}

# Instancia global del factory
_parser_factory = SIEMParserFactory()

def get_parser(parser_type: str) -> BaseOutputParser:
    """Obtener parser específico"""
    return _parser_factory.get_parser(parser_type)

def parse_response(text: str, response_type: str) -> Dict[str, Any]:
    """Parsear respuesta con el parser apropiado"""
    return _parser_factory.parse_response(text, response_type)
