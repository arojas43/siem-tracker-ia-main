"""
API endpoints para el chatbot de comercio exterior
"""

import os
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from jose import JWTError, jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime
import json
import re
from pathlib import Path
import requests

from langchain_openai import ChatOpenAI

from chatbot_agent_real_data import get_chatbot_agent, UserContext, ChatResponse
from enhanced_chatbot_agent import get_enhanced_chatbot_agent, EnhancedUserContext, EnhancedChatResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])
security = HTTPBearer()
# Bearer opcional para endpoints donde el token podría faltar (no romper)
security_optional = HTTPBearer(auto_error=False)


def decode_jwt_token(token: str) -> Dict[str, Any]:
    """Decodifica y valida un JWT usando SECRET_KEY y ALGORITHM.

    Extrae un identificador de usuario ('user_id' | 'sub' | 'email') y
    determina 'user_type' si está presente o lo infiere.
    """
    secret = os.getenv('SECRET_KEY')
    algorithm = os.getenv('ALGORITHM', 'HS256')

    if not secret:
        # Config faltante: la validación real no puede proceder
        raise HTTPException(status_code=500, detail="SECRET_KEY no configurado en entorno")

    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token JWT inválido o expirado")

    # Identificador de usuario (flexible según claims disponibles)
    uid = payload.get('user_id') or payload.get('sub') or payload.get('email')
    if not uid:
        raise HTTPException(status_code=401, detail="Token sin claim de usuario (user_id/sub/email)")

    # Determinar tipo de usuario
    user_type = payload.get('user_type')
    if not user_type:
        email = payload.get('email') or ""
        is_staff = payload.get('is_staff') or payload.get('is_admin')
        if is_staff or (isinstance(email, str) and email.endswith('@siem.business')):
            user_type = 'siem'
        else:
            user_type = 'client'

    name = payload.get('name') or payload.get('given_name') or payload.get('preferred_username') or str(uid)

    return {
        "id": str(uid),
        "user_type": user_type,
        "name": name,
        "email": payload.get('email')
    }

def convert_markdown_table_to_html(text: str) -> str:
    """Convierte tablas markdown a HTML"""
    lines = text.split('\n')
    html_lines = []
    in_table = False
    table_lines = []
    
    for line in lines:
        if '|' in line and not line.strip().startswith('---'):
            # Es una línea de tabla
            if not in_table:
                in_table = True
                table_lines = []
            table_lines.append(line)
        elif line.strip().startswith('---') and in_table:
            # Es el separador de tabla, lo ignoramos
            continue
        else:
            # No es una línea de tabla
            if in_table and table_lines:
                # Procesar la tabla acumulada
                html_table = process_table_lines(table_lines)
                html_lines.append(html_table)
                table_lines = []
                in_table = False
            html_lines.append(line)
    
    # Procesar tabla final si existe
    if in_table and table_lines:
        html_table = process_table_lines(table_lines)
        html_lines.append(html_table)
    
    return '\n'.join(html_lines)

def process_table_lines(table_lines):
    """Procesa las líneas de una tabla markdown y las convierte a HTML"""
    if not table_lines:
        return ""
    
    # Limpiar líneas y extraer celdas
    rows = []
    for line in table_lines:
        if line.strip():
            cells = [cell.strip() for cell in line.split('|')]
            # Remover celdas vacías del inicio y final
            if cells and not cells[0]:
                cells = cells[1:]
            if cells and not cells[-1]:
                cells = cells[:-1]
            if cells:
                rows.append(cells)
    
    if not rows:
        return ""
    
    # Crear HTML de la tabla
    html = '<div class="table-responsive"><table class="table table-striped table-bordered">'
    
    for i, row in enumerate(rows):
        if i == 0:
            # Primera fila es el header
            html += '<thead class="table-dark"><tr>'
            for cell in row:
                # Limpiar markdown bold
                clean_cell = cell.replace('**', '').strip()
                html += f'<th scope="col" class="fw-bold text-center">{clean_cell}</th>'
            html += '</tr></thead><tbody>'
        else:
            # Filas de datos
            html += '<tr>'
            for cell in row:
                # Limpiar markdown bold
                clean_cell = cell.replace('**', '').strip()
                html += f'<td class="table-cell-content">{clean_cell}</td>'
            html += '</tr>'
    
    html += '</tbody></table></div>'
    return html

def convert_markdown_to_html(text: str) -> str:
    """Convierte elementos markdown básicos a HTML"""
    # Convertir negritas
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'__(.*?)__', r'<strong>\1</strong>', text)
    
    # Convertir cursivas
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    text = re.sub(r'_(.*?)_', r'<em>\1</em>', text)
    
    # Convertir títulos
    text = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', text, flags=re.MULTILINE)
    text = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', text, flags=re.MULTILINE)
    text = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', text, flags=re.MULTILINE)
    
    # Convertir listas
    text = re.sub(r'^\- (.*?)$', r'<li>\1</li>', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\. (.*?)$', r'<li>\1</li>', text, flags=re.MULTILINE)
    
    # Agrupar listas
    text = re.sub(r'(<li>.*?</li>)', r'<ul>\1</ul>', text, flags=re.DOTALL)
    
    # Convertir saltos de línea
    text = text.replace('\n', '<br>')
    
    return text

# Modelos Pydantic
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    user_id: str
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None

# Modelos para Deep Chat (texto plano)
class DeepChatMessage(BaseModel):
    role: str
    text: str

class DeepChatRequest(BaseModel):
    messages: List[DeepChatMessage]
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponseModel(BaseModel):
    response: str
    structured_data: Optional[Dict[str, Any]] = None
    confidence: float
    sources: List[str]
    suggested_actions: List[str]
    follow_up_questions: Optional[List[str]] = None
    model_used: str
    timestamp: str
    session_id: str
    memory_used: bool = False
    entities_extracted: Optional[List[str]] = None

class ConversationHistory(BaseModel):
    messages: List[ChatMessage]
    session_id: str
    created_at: str
    updated_at: str

# Almacenamiento temporal de conversaciones (en producción usar Redis o DB)
conversation_storage: Dict[str, List[ChatMessage]] = {}

# ==========================
# Router dinámico de APIs (Postman)
# ==========================

class APISummary(BaseModel):
    name: str
    method: str
    path: str
    query_params: List[str] = []
    path_params: List[str] = []
    description: Optional[str] = None

class AskApiRequest(BaseModel):
    query: str
    # opcional: parámetros sugeridos por el front si ya los tiene
    params: Optional[Dict[str, Any]] = None

class AskApiResponse(BaseModel):
    decided_endpoint: Optional[APISummary] = None
    missing_params: Optional[List[str]] = None
    called: bool = False
    status_code: Optional[int] = None
    result: Optional[Any] = None
    error: Optional[str] = None

_API_REGISTRY: List[Dict[str, Any]] = []
_POSTMAN_COLLECTION_PATHS_TRIED: List[Path] = []
_LLM_INSTANCE: Optional[ChatOpenAI] = None


def _find_postman_collection_file() -> Optional[Path]:
    # 1) Env var
    env_path = os.getenv("POSTMAN_COLLECTION_PATH")
    if env_path and Path(env_path).exists():
        return Path(env_path)
    # 2) Ruta absoluta del usuario (si existe en esta máquina)
    candidate = Path(r"c:/Users/rojas/Downloads/siem-tracker-ia-main(1)/siem-tracker-ia-main/SIEM API.postman_collection.json")
    if candidate.exists():
        return candidate
    # 3) Proyecto raíz (misma carpeta del repo)
    here = Path(__file__).resolve()
    candidates = [
        here.parents[1] / "SIEM API.postman_collection.json",
        here.parents[0] / "SIEM API.postman_collection.json",
    ]
    for c in candidates:
        if c.exists():
            return c
    return None


def _flatten_postman_items(items: List[Dict[str, Any]], parent_name: str = "") -> List[Dict[str, Any]]:
    results = []
    for it in items:
        name = it.get("name", "")
        full_name = f"{parent_name}/{name}" if parent_name else name
        if "request" in it:
            req = it["request"]
            url = req.get("url", {})
            method = req.get("method", "GET")
            path_parts = url.get("path", []) or []
            # En algunas colecciones, la última parte puede ser ""; la removemos
            path_parts = [p for p in path_parts if p]
            path = "/" + "/".join(path_parts)
            qp = [q.get("key") for q in url.get("query", []) if q.get("key")]
            pv = [v.get("key") for v in url.get("variable", []) if v.get("key")]
            desc = None
            try:
                desc = req.get("description")
            except Exception:
                desc = None
            results.append({
                "name": full_name,
                "method": method,
                "path": path,
                "query_params": qp,
                "path_params": pv,
                "description": desc,
            })
        elif "item" in it:
            results.extend(_flatten_postman_items(it["item"], full_name))
    return results


def _load_postman_registry() -> None:
    global _API_REGISTRY
    if _API_REGISTRY:
        return
    path = _find_postman_collection_file()
    if not path:
        logger.warning("Postman collection no encontrada para el router dinámico.")
        _API_REGISTRY = []
        return
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        items = data.get("item", [])
        _API_REGISTRY = _flatten_postman_items(items)
        logger.info(f"Cargados {_API_REGISTRY and len(_API_REGISTRY) or 0} endpoints desde Postman: {path}")
    except Exception as e:
        logger.error(f"Error cargando Postman collection: {e}")
        _API_REGISTRY = []


def _score_endpoint(user_query: str, ep: Dict[str, Any], page_hint: Optional[str] = None) -> float:
    q = (user_query or "").lower()
    score = 0.0

    # Sinónimos en español -> inglés para mejorar matching contra nombres/paths de la colección
    synonyms = {
        "tarea": ["task"], "tareas": ["task"],
        "operacion": ["operation"], "operación": ["operation"], "op": ["operation"],
        "fase": ["phase"], "fases": ["phase"],
        "cliente": ["client"], "clientes": ["client"],
        "proveedor": ["supplier"], "proveedores": ["supplier"],
        "aduana": ["customs"], "aduanas": ["customs"],
        "cita": ["appointment"], "citas": ["appointment"],
        "asignacion": ["assignment"], "asignación": ["assignment"], "asignaciones": ["assignment"],
        "contenedor": ["container"], "contenedores": ["container"],
        "documento": ["document"], "documentos": ["document"],
        "usuario": ["user"], "usuarios": ["user"],
        "busqueda": ["search"], "búsqueda": ["search"]
    }

    # Construir set de tokens y sus equivalentes
    tokens = set(re.findall(r"[a-zA-Záéíóúñ0-9_-]+", q))
    expanded_tokens = set(tokens)
    for t in list(tokens):
        if t in synonyms:
            for eq in synonyms[t]:
                expanded_tokens.add(eq)

    # Normalizar campos del endpoint
    fields = [ep.get("name", ""), ep.get("path", "")]
    fields_norm = [f.lower() for f in fields if f]

    # Matching por ocurrencias
    for s in fields_norm:
        for token in expanded_tokens:
            if token and token in s:
                score += 1.0

    # Param keywords directas
    for k in ep.get("query_params", []) + ep.get("path_params", []):
        if not k:
            continue
        kl = k.lower()
        if kl in expanded_tokens:
            score += 0.5

    # Boost por dominios (por si los campos son ambiguos)
    dom_boosts = [
        ("task", 1.2), ("operation", 1.0), ("phase", 0.8),
        ("client", 1.0), ("supplier", 1.0), ("customs", 0.9),
        ("appointment", 0.9), ("assignment", 0.9), ("container", 0.9),
        ("document", 0.7)
    ]
    for dom, inc in dom_boosts:
        if any(dom in s for s in fields_norm) and dom in expanded_tokens:
            score += inc

    # Boost por hint de página del frontend
    if page_hint:
        ph = page_hint.lower()
        if "operation" in fields_norm[0] if fields_norm else False:
            pass  # guard against index
        page_map = {
            "/operations": ["operation", "phase", "task"],
            "/clients": ["client", "operation"],
            "/suppliers": ["supplier"],
            "/customs": ["customs"],
            "/tasks": ["task"],
        }
        for key, kws in page_map.items():
            if key in ph:
                for kw in kws:
                    if any(kw in s for s in fields_norm):
                        score += 0.8

    return score


def _choose_candidates(user_query: str, top_k: int = 5, page_hint: Optional[str] = None) -> List[Dict[str, Any]]:
    _load_postman_registry()
    if not _API_REGISTRY:
        return []
    scored = [(ep, _score_endpoint(user_query, ep, page_hint=page_hint)) for ep in _API_REGISTRY]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [ep for ep, _ in scored[:top_k] if _ > 0]


def _get_llm() -> ChatOpenAI:
    global _LLM_INSTANCE
    if _LLM_INSTANCE is None:
        lm_studio_url = os.getenv('LM_STUDIO_URL', 'http://localhost:1234')
        lm_studio_model = os.getenv('LM_STUDIO_MODEL', 'openai/gpt-oss-20b')
        _LLM_INSTANCE = ChatOpenAI(
            model=lm_studio_model,
            temperature=0.0,
            max_tokens=800,
            openai_api_key="dummy",
            openai_api_base=f"{lm_studio_url}/v1/"
        )
    return _LLM_INSTANCE


def _plan_with_llm(user_query: str, candidates: List[Dict[str, Any]], user_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Pide al LLM elegir endpoint y extraer parámetros.
    Devuelve dict con keys: endpoint_index (int), params (dict), missing_params (list)
    """
    if not candidates:
        return {"endpoint_index": None, "params": {}, "missing_params": ["no_candidates"]}

    # Construir un contexto compacto con los candidatos
    lines = []
    for i, ep in enumerate(candidates):
        qps = ",".join(ep.get("query_params", [])) or "-"
        pps = ",".join(ep.get("path_params", [])) or "-"
        lines.append(f"[{i}] {ep['method']} {ep['path']} | qp:{qps} | pp:{pps} | name:{ep['name']}")

    system = (
        "Eres un planificador de llamadas API. Recibes la consulta del usuario y una lista de endpoints"
        " candidatos. Elige el endpoint más adecuado y extrae parámetros del texto."
        " Responde SOLO en JSON con las claves: endpoint_index (int), params (obj), missing_params (array de strings)."
        " Si faltan parámetros obligatorios de ruta o query, inclúyelos en missing_params."
    )
    user = (
        f"Consulta: {user_query}\n"
        f"Candidatos:\n" + "\n".join(lines) + "\n" +
        f"Parametros_provistos: {json.dumps(user_params or {}, ensure_ascii=False)}"
    )

    llm = _get_llm()
    try:
        msg = llm.invoke([
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ])
        content = msg.content if hasattr(msg, "content") else str(msg)
        # Intentar parsear JSON del contenido
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1 and end > start:
            parsed = json.loads(content[start:end+1])
        else:
            parsed = {"endpoint_index": 0, "params": user_params or {}, "missing_params": []}
    except Exception as e:
        logger.warning(f"LLM planner fallo, usando heurística por defecto: {e}")
        parsed = {"endpoint_index": 0, "params": user_params or {}, "missing_params": []}
    return parsed


def _build_url(base_url: str, ep: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    path = ep.get("path", "/")
    # Sustituir path params tipo ":id" si existieran en path (Postman guarda en url.variable)
    # Nuestra representación no contiene ":id" explícito, así que solo agregamos al final si es necesario.
    # En caso general, asumimos que ep['path_params'] vienen en el mismo orden que en el path (Postman)
    final_path = path
    missing = []
    for p in ep.get("path_params", []):
        # Si el path literal contiene ":{p}", sustitúyelo; si no, añade "/{valor}" al final
        val = params.get(p)
        if val is None:
            missing.append(p)
            continue
        token = f":{p}"
        if token in final_path:
            final_path = final_path.replace(token, str(val))
        else:
            # añadir si el path no contiene placeholder
            if not final_path.endswith("/"):
                final_path += "/"
            final_path += str(val) + "/"

    # Query params (opcional por defecto, incluir solo los provistos)
    qparams = {}
    for q in ep.get("query_params", []):
        if params.get(q) is not None:
            qparams[q] = params[q]

    url = base_url.rstrip("/") + final_path
    return {"url": url, "missing": list(sorted(set(missing))), "query": qparams}


def _summarize_plain_text(user_query: str, endpoint: Dict[str, Any], result: Any) -> str:
    """Genera un resumen en texto plano útil, priorizando datos concretos.

    - Si es posible, crea un resumen específico para "operaciones": totales, por estado,
      próximas/atrasadas y detalle si se preguntó por un código concreto.
    - Si no se reconoce la estructura, usa un resumen breve via LLM como respaldo.
    - Siempre en español, sin markdown, sin tablas, y sin viñetas.
    """
    # Heurísticas y utilidades locales para mantener el resumen enfocado y determinista
    def _lower_keys(d: Dict[str, Any]) -> Dict[str, Any]:
        return {str(k).lower(): v for k, v in d.items()} if isinstance(d, dict) else {}

    def _first(d: Dict[str, Any], keys: list[str], default: Any = None) -> Any:
        lk = _lower_keys(d)
        for k in keys:
            if k in lk and lk[k] not in (None, ""):
                return lk[k]
        return default

    def _parse_date(s: Any) -> Optional[datetime]:
        if not s or not isinstance(s, (str,)):
            return None
        t = s.strip()
        try:
            # ISO 8601 básico
            t2 = t.replace("Z", "+00:00")
            return datetime.fromisoformat(t2)
        except Exception:
            pass
        # Formatos comunes simples
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(t, fmt)
            except Exception:
                continue
        return None

    def _extract_items(obj: Any) -> tuple[list[Dict[str, Any]], int]:
        # Soportar { total_count, results } o list directa
        if isinstance(obj, dict):
            results = obj.get("results") or obj.get("items") or obj.get("data")
            if isinstance(results, list):
                total = obj.get("total_count") if isinstance(obj.get("total_count"), int) else len(results)
                return results, int(total)
            # Si es un dict con una sola colección
            for v in obj.values():
                if isinstance(v, list) and v and isinstance(v[0], dict):
                    return v, len(v)
        if isinstance(obj, list):
            return obj, len(obj)
        return [], 0

    def _ops_summary() -> Optional[str]:
        # Detectar si el endpoint parece de operaciones
        name = (endpoint.get("name") or "").lower()
        path = (endpoint.get("path") or "").lower()
        if not any(k in name or k in path for k in ("operation", "/operations", "operacion", "operación")):
            return None

        items, total = _extract_items(result)
        if total == 0:
            # Si no hay datos, no forzar un texto grande
            return "No encontré operaciones para esta consulta. Si esperabas resultados, intenta especificar un código de operación o un rango de fechas."

        # Código mencionado en la consulta del usuario (por ejemplo SOD25-058)
        op_code_from_query = None
        m = re.search(r"\b[A-Z]{2,}[0-9]{2,}-[0-9]{2,}\b", user_query or "")
        if m:
            op_code_from_query = m.group(0)

        # Contar por estado y calcular urgencia (fecha próxima o atraso)
        state_counts: Dict[str, int] = {}
        today = datetime.now()
        enriched = []
        for it in items:
            if not isinstance(it, dict):
                continue
            code = _first(it, ["operation_code", "operation", "code", "folio", "id"])
            status = _first(it, ["status", "state", "estado", "phase", "fase"]) or "desconocido"
            due_raw = _first(it, ["due_date", "eta", "estimated_date", "fecha_estimacion", "fecha", "date"])
            due = _parse_date(due_raw)
            client = _first(it, ["client", "client_name", "cliente", "cliente_nombre", "customer"]) or ""
            supplier = _first(it, ["supplier", "supplier_name", "proveedor", "proveedor_nombre"]) or ""
            pending_tasks = _first(it, ["pending_tasks", "tareas_pendientes", "open_tasks", "tasks_pending", "tasks_count"], 0)
            try:
                pending_tasks = int(pending_tasks)
            except Exception:
                pending_tasks = 0

            st_key = str(status).strip().lower() or "desconocido"
            state_counts[st_key] = state_counts.get(st_key, 0) + 1

            days_to = None
            if due:
                try:
                    delta = (due - today).days
                    days_to = int(delta)
                except Exception:
                    days_to = None

            enriched.append({
                "code": code,
                "status": status,
                "client": client,
                "supplier": supplier,
                "due": due,
                "days_to": days_to,
                "pending_tasks": pending_tasks,
                "raw": it,
            })

        # Ordenar por urgencia: primero atrasadas (days_to < 0), luego más próximas; sin fecha al final
        def _urgency_key(x: Dict[str, Any]):
            if x.get("days_to") is None:
                return (2, 99999)
            d = x["days_to"]
            if d < 0:
                return (0, abs(d))  # más negativo = más urgente
            return (1, d)

        enriched.sort(key=_urgency_key)

        # Detalle prioritario si se mencionó una operación específica
        detail_line = ""
        if op_code_from_query:
            chosen = None
            for x in enriched:
                if str(x.get("code") or "").upper() == op_code_from_query.upper():
                    chosen = x
                    break
            if chosen:
                dtxt = "sin fecha"
                if chosen.get("due"):
                    try:
                        dtxt = chosen["due"].strftime("%Y-%m-%d")
                    except Exception:
                        dtxt = str(chosen["due"])
                when = "atrasada" if (isinstance(chosen.get("days_to"), int) and chosen["days_to"] < 0) else "próxima"
                detail_line = (
                    f"Detalle de {op_code_from_query}: estado {chosen['status']}, fecha {dtxt} ({when}), "
                    f"tareas pendientes {chosen['pending_tasks']}, cliente {chosen['client'] or 'N/D'}, proveedor {chosen['supplier'] or 'N/D'}."
                )

        # Construir texto de resumen
        # 1) Totales y estado
        estados_compactos = ", ".join([f"{k}: {v}" for k, v in list(state_counts.items())[:4]])
        header = f"Encontré {total} operaciones. Estados más comunes: {estados_compactos}."

        # 2) Top 3 por urgencia
        tops = []
        for x in enriched[:3]:
            code = x.get("code") or "(sin código)"
            st = x.get("status") or "desconocido"
            pt = x.get("pending_tasks") or 0
            client = x.get("client") or "N/D"
            dtxt = "sin fecha"
            if x.get("due"):
                try:
                    dtxt = x["due"].strftime("%Y-%m-%d")
                except Exception:
                    dtxt = str(x["due"])[:10]
            if isinstance(x.get("days_to"), int):
                if x["days_to"] < 0:
                    dtxt = f"{dtxt} (atrasada {abs(x['days_to'])} días)"
                elif x["days_to"] == 0:
                    dtxt = f"{dtxt} (vence hoy)"
                else:
                    dtxt = f"{dtxt} (en {x['days_to']} días)"
            tops.append(f"{code}: estado {st}, fecha {dtxt}, tareas pendientes {pt}, cliente {client}.")

        tops_text = " " .join(tops) if tops else ""

        # 3) Si hay detalle específico, antepónlo
        if detail_line:
            return f"{detail_line} {header} {tops_text}".strip()
        return f"{header} {tops_text}".strip()

    # 1) Intento de resumen determinista para operaciones
    try:
        ops = _ops_summary()
        if ops:
            return ops
    except Exception:
        # Si algo falla, seguimos al resumen genérico
        pass

    # 2) Resumen genérico vía LLM (respaldo)
    try:
        try:
            raw = json.dumps(result, ensure_ascii=False) if not isinstance(result, str) else result
        except Exception:
            raw = str(result)
        if len(raw) > 8000:
            raw = raw[:8000] + "..."

        system = (
            "Eres un analista que explica resultados de una API de SIEM. "
            "Debes responder en español, en texto plano, sin markdown y sin tablas. "
            "La respuesta debe ser clara, breve y útil. Evita viñetas. "
            "Incluye solo la información más relevante al usuario."
        )
        user = (
            f"Consulta del usuario: {user_query}\n"
            f"Endpoint: {endpoint.get('method','GET')} {endpoint.get('path','/')}\n"
            f"Nombre: {endpoint.get('name','')}\n"
            f"Datos: {raw}"
        )
        llm = _get_llm()
        msg = llm.invoke([
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ])
        content = msg.content if hasattr(msg, "content") else str(msg)
        return content.replace("|", " ")
    except Exception:
        try:
            return f"Resultado consultado correctamente. Datos: {json.dumps(result, ensure_ascii=False)[:1000]}"
        except Exception:
            return "Resultado consultado correctamente."


def _normalize_params(
    raw_params: Optional[Dict[str, Any]],
    provided: Optional[Dict[str, Any]] = None,
    user_query: Optional[str] = None
) -> Dict[str, Any]:
    """Normaliza y enriquece parámetros combinando sinónimos es/en y extrayendo patrones comunes.

    - Combina params provistos por el front con los inferidos por LLM.
    - Mapea claves en español/variantes a un conjunto canónico y luego genera alias comunes
      para maximizar compatibilidad con endpoints heterogéneos (operationId, operation_code, etc.).
    - Extrae posibles códigos como SOD25-058 de la consulta del usuario y los usa como operación.
    """
    merged_in: Dict[str, Any] = {}
    if provided:
        merged_in.update(provided)
    if raw_params:
        merged_in.update(raw_params)

    # Normalizar claves a minúsculas para procesar
    lower_map = {str(k).lower(): v for k, v in merged_in.items()}

    # Mapa canónico (key de entrada -> canónica)
    canon = {
        "operacion": "operation",
        "operación": "operation",
        "operation": "operation",
        "operation_code": "operation",
        "codigo_operacion": "operation",
        "código_operación": "operation",
        "op": "operation",
        "operationid": "operation",
        "operation_id": "operation",

        "fase": "phase",
        "phase": "phase",
        "phase_id": "phase",
        "id_fase": "phase",

        "cliente": "client",
        "client": "client",
        "client_id": "client",
        "cliente_id": "client",

        "proveedor": "supplier",
        "supplier": "supplier",
        "proveedor_id": "supplier",
        "supplier_id": "supplier",

        "aduana": "customs",
        "customs": "customs",

        "cita": "appointment",
        "appointment": "appointment",

        "asignacion": "assignment",
        "asignación": "assignment",
        "assignment": "assignment",

        "contenedor": "container",
        "container": "container",

        "busqueda": "search",
        "búsqueda": "search",
        "search": "search",

        "orden": "ordering",
        "ordenar": "ordering",
        "ordering": "ordering",

        "limite": "limit",
        "límite": "limit",
        "limit": "limit",

        "desde": "offset",
        "offset": "offset",

        "pagina": "page",
        "página": "page",
        "page": "page",

        "id": "id",
    }

    canonical: Dict[str, Any] = {}
    for k, v in lower_map.items():
        key = canon.get(k, k)
        canonical[key] = v

    # Extraer patrones comunes de la consulta del usuario
    if user_query:
        uq = user_query.strip()
        # Código de operación tipo ABC12-345 o similar
        m = re.search(r"\b[A-Z]{2,}[0-9]{2,}-[0-9]{2,}\b", uq)
        if m and "operation" not in canonical:
            canonical["operation"] = m.group(0)
        # ID alfanumérico largo (fallback genérico)
        if "id" not in canonical:
            m2 = re.search(r"\bid\s*[:#]?\s*([A-Za-z0-9\-]{6,})\b", uq, flags=re.IGNORECASE)
            if m2:
                canonical["id"] = m2.group(1)

    # Expandir alias a múltiples variantes comunes para maximizar match con endpoints
    expanded = dict(canonical)
    if "operation" in canonical:
        v = canonical["operation"]
        for alias in ["operation", "operation_code", "operationid", "operation_id", "code", "op"]:
            expanded.setdefault(alias, v)
    if "phase" in canonical:
        v = canonical["phase"]
        for alias in ["phase", "phase_id", "fase", "id_fase"]:
            expanded.setdefault(alias, v)
    if "client" in canonical:
        v = canonical["client"]
        for alias in ["client", "client_id", "cliente", "cliente_id"]:
            expanded.setdefault(alias, v)
    if "supplier" in canonical:
        v = canonical["supplier"]
        for alias in ["supplier", "supplier_id", "proveedor", "proveedor_id"]:
            expanded.setdefault(alias, v)
    if "customs" in canonical:
        v = canonical["customs"]
        for alias in ["customs", "aduana"]:
            expanded.setdefault(alias, v)

    return expanded


@router.get("/apis", response_model=List[APISummary])
async def list_parsed_apis():
    """Lista resumida de endpoints parseados desde el Postman collection."""
    _load_postman_registry()
    out: List[APISummary] = []
    for ep in _API_REGISTRY:
        out.append(APISummary(
            name=ep.get("name", ""),
            method=ep.get("method", "GET"),
            path=ep.get("path", "/"),
            query_params=ep.get("query_params", []),
            path_params=ep.get("path_params", []),
            description=ep.get("description")
        ))
    return out


@router.post("/ask-api", response_model=AskApiResponse)
async def ask_api_router(
    request: AskApiRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Decide y llama al endpoint adecuado en tiempo real usando la colección Postman.

    - Usa el JWT entrante para autorizar la llamada hacia el backend SIEM.
    - Devuelve el resultado crudo del endpoint llamado o indica qué params faltan.
    """
    try:
        base_url = os.getenv('SIEM_API_BASE_URL', 'http://localhost:8000')
        user_query = request.query.strip()
        if not user_query:
            raise HTTPException(status_code=400, detail="'query' es requerido")

        # 1) Candidatos por heurística (con pista de página si viene del front)
        page_hint = request.params.get("_current_page") if isinstance(request.params, dict) else None
        candidates = _choose_candidates(user_query, top_k=5, page_hint=page_hint)
        if not candidates:
            return AskApiResponse(error="No se encontraron endpoints candidatos basados en la consulta.")

        # 2) Pedirle al LLM que elija y extraiga params
        plan = _plan_with_llm(user_query, candidates, user_params=request.params)
        ep_idx = plan.get("endpoint_index")
        if ep_idx is None or not isinstance(ep_idx, int) or ep_idx < 0 or ep_idx >= len(candidates):
            ep_idx = 0
        chosen = candidates[ep_idx]
        params = _normalize_params(plan.get("params") or {}, provided=request.params, user_query=user_query)

        # 3) Construir URL y detectar params faltantes
        built = _build_url(base_url, chosen, params)
        missing = built.get("missing", [])

        decided_summary = APISummary(
            name=chosen.get("name", ""),
            method=chosen.get("method", "GET"),
            path=chosen.get("path", "/"),
            query_params=chosen.get("query_params", []),
            path_params=chosen.get("path_params", []),
            description=chosen.get("description")
        )

        if missing:
            return AskApiResponse(
                decided_endpoint=decided_summary,
                missing_params=missing,
                called=False,
                result=None
            )

        # 4) Llamar API de SIEM
        headers = {
            "Authorization": f"Bearer {credentials.credentials}",
            "Accept": "application/json"
        }
        method = chosen.get("method", "GET").upper()
        url = built["url"]
        query = built.get("query", {})

        try:
            if method == "GET":
                resp = requests.get(url, headers=headers, params=query, timeout=20)
            elif method == "POST":
                # Si en el futuro soportamos body dinámico, usar request.params.get("body")
                resp = requests.post(url, headers=headers, json=query or {}, timeout=20)
            elif method in ("PUT", "PATCH"):
                resp = requests.request(method, url, headers=headers, json=query or {}, timeout=20)
            elif method == "DELETE":
                resp = requests.delete(url, headers=headers, params=query, timeout=20)
            else:
                return AskApiResponse(
                    decided_endpoint=decided_summary,
                    called=False,
                    error=f"Método no soportado: {method}"
                )
        except Exception as e:
            return AskApiResponse(
                decided_endpoint=decided_summary,
                called=False,
                error=f"Error llamando API: {e}"
            )

        # Intentar parsear JSON, si no, devolver texto
        result: Any
        try:
            result = resp.json()
        except Exception:
            result = resp.text

        return AskApiResponse(
            decided_endpoint=decided_summary,
            called=True,
            status_code=resp.status_code,
            result=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en ask-api: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/ask-and-summarize")
async def ask_and_summarize(
    request: AskApiRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Selecciona un endpoint, lo invoca y devuelve una respuesta en texto plano (sin markdown).

    Útil para preguntas del tipo: "cómo va mi última operación" o "cuéntame sobre la operación SOD25-058".
    """
    base_url = os.getenv('SIEM_API_BASE_URL', 'http://localhost:8000')
    user_query = (request.query or "").strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="'query' es requerido")

    # 1) Candidatos y plan (usar pista de página si el front la mandó en params)
    page_hint = request.params.get("_current_page") if isinstance(request.params, dict) else None
    candidates = _choose_candidates(user_query, top_k=5, page_hint=page_hint)
    if not candidates:
        return {
            "answer": "No encontré un endpoint adecuado para tu consulta.",
            "called": False,
            "missing_params": ["endpoint"],
        }

    plan = _plan_with_llm(user_query, candidates, user_params=request.params)
    ep_idx = plan.get("endpoint_index")
    if ep_idx is None or not isinstance(ep_idx, int) or ep_idx < 0 or ep_idx >= len(candidates):
        ep_idx = 0
    chosen = candidates[ep_idx]
    params = _normalize_params(plan.get("params") or {}, provided=request.params, user_query=user_query)

    # 2) Construir URL y validar params
    built = _build_url(base_url, chosen, params)
    missing = built.get("missing", [])

    if missing:
        return {
            "answer": f"Para responder necesito estos datos: {', '.join(missing)}.",
            "called": False,
            "missing_params": missing,
            "decided_endpoint": {
                "name": chosen.get("name",""),
                "method": chosen.get("method","GET"),
                "path": chosen.get("path","/"),
            }
        }

    # 3) Llamar API
    headers = {
        "Authorization": f"Bearer {credentials.credentials}",
        "Accept": "application/json"
    }
    method = chosen.get("method", "GET").upper()
    url = built["url"]
    query = built.get("query", {})

    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, params=query, timeout=20)
        elif method == "POST":
            resp = requests.post(url, headers=headers, json=query or {}, timeout=20)
        elif method in ("PUT", "PATCH"):
            resp = requests.request(method, url, headers=headers, json=query or {}, timeout=20)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers, params=query, timeout=20)
        else:
            return {
                "answer": f"El método {method} no está soportado en este flujo.",
                "called": False
            }
    except Exception as e:
        return {
            "answer": f"No pude consultar el sistema en este momento: {e}",
            "called": False
        }

    try:
        result = resp.json()
    except Exception:
        result = resp.text

    # 4) Resumen en texto plano
    answer = _summarize_plain_text(user_query, chosen, result)

    return {
        "answer": answer,
        "called": True,
        "status_code": resp.status_code,
        "decided_endpoint": {
            "name": chosen.get("name",""),
            "method": chosen.get("method","GET"),
            "path": chosen.get("path","/"),
        }
    }

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Obtener usuario actual desde el token JWT"""
    # En modo desarrollo, usar usuario mock directamente sin validar token
    if os.getenv('ENVIRONMENT', 'development') == 'development':
        return {
            "id": "whatsapp_user",
            "user_type": "client",
            "name": "WhatsApp User",
            "email": "whatsapp@siem.business"
        }

    # Validación real del JWT
    return decode_jwt_token(credentials.credentials)

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Dict[str, Any]:
    """Obtener usuario actual con autenticación opcional para WhatsApp"""
    # Si no hay credenciales (como desde WhatsApp), usar usuario por defecto
    if not credentials:
        return {
            "id": "whatsapp_user",
            "user_type": "client", 
            "name": "WhatsApp User",
            "email": "whatsapp@siem.business"
        }
    # Si hay credenciales, intentar decodificar el JWT.
    # En desarrollo, permitir fallback si la validación no está configurada correctamente.
    if os.getenv('ENVIRONMENT', 'development') == 'development':
        try:
            return decode_jwt_token(credentials.credentials)
        except Exception:
            return {
                "id": "authenticated_user",
                "user_type": "siem",
                "name": "Authenticated User", 
                "email": "user@siem.business"
            }
    return decode_jwt_token(credentials.credentials)

@router.post("/chat", response_model=ChatResponseModel)
async def chat_with_agent(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user_optional)
):
    """
    Endpoint principal para chat con el agente de comercio exterior mejorado
    """
    try:
        # Obtener agente mejorado
        agent = get_enhanced_chatbot_agent()
        
        # Crear contexto del usuario mejorado
        # Preferir user_type del JWT salvo que el cliente lo defina explícitamente en el contexto
        resolved_user_type = (
            request.context.get("user_type")
            if request.context and request.context.get("user_type")
            else current_user.get("user_type", "client")
        )

        user_context = EnhancedUserContext(
            user_id=request.user_id or current_user["id"],
            user_type=resolved_user_type,
            current_page=request.context.get("current_page", "/") if request.context else "/",
            session_id=request.session_id or f"session_{current_user['id']}_{int(datetime.now().timestamp())}",
            preferences=request.context.get("preferences") if request.context else None,
            last_activity=datetime.now().isoformat()
        )
        
        # Obtener historial de conversación
        session_id = user_context.session_id
        if session_id not in conversation_storage:
            conversation_storage[session_id] = []
        
        # Agregar mensaje del usuario al historial
        user_message = ChatMessage(role="user", content=request.message)
        conversation_storage[session_id].append(user_message)
        
        # Mantener solo los últimos 20 mensajes
        if len(conversation_storage[session_id]) > 20:
            conversation_storage[session_id] = conversation_storage[session_id][-20:]
        
        # Convertir historial a formato esperado por el agente
        messages = [{"role": msg.role, "content": msg.content} for msg in conversation_storage[session_id]]
        
        # Procesar con el agente
        response = await agent.process_chat(messages, user_context)
        
        # Agregar respuesta del agente al historial
        assistant_message = ChatMessage(role="assistant", content=response.response)
        conversation_storage[session_id].append(assistant_message)
        
        # Log de la conversación
        background_tasks.add_task(
            log_conversation,
            session_id,
            request.message,
            response.response,
            user_context
        )
        
        return ChatResponseModel(
            response=response.response,
            structured_data=response.structured_data,
            confidence=response.confidence,
            sources=response.sources,
            suggested_actions=response.suggested_actions,
            follow_up_questions=response.follow_up_questions,
            model_used=response.model_used,
            timestamp=datetime.now().isoformat(),
            session_id=session_id,
            memory_used=response.memory_used,
            entities_extracted=response.entities_extracted
        )
        
    except Exception as e:
        logger.error(f"Error en chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/conversation/{session_id}", response_model=ConversationHistory)
async def get_conversation_history(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Obtener historial de conversación
    """
    try:
        if session_id not in conversation_storage:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")
        
        messages = conversation_storage[session_id]
        
        return ConversationHistory(
            messages=messages,
            session_id=session_id,
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo historial: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.delete("/conversation/{session_id}")
async def clear_conversation(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Limpiar historial de conversación
    """
    try:
        if session_id in conversation_storage:
            del conversation_storage[session_id]
            return {"message": "Conversación limpiada exitosamente"}
        else:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error limpiando conversación: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/suggestions")
async def get_suggestions(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Obtener sugerencias de consultas comunes
    """
    suggestions = [
        {
            "category": "Operaciones",
            "queries": [
                "¿Cuántas operaciones tengo activas?",
                "¿Cuál es el estado de la operación SOD25-058?",
                "¿Qué operaciones están pendientes?",
                "¿Cuáles son mis operaciones más recientes?"
            ]
        },
        {
            "category": "Tareas",
            "queries": [
                "¿Qué tareas tengo pendientes?",
                "¿Cuáles son mis tareas de esta semana?",
                "¿Qué tareas están atrasadas?",
                "¿Cómo puedo completar una tarea?"
            ]
        },
        {
            "category": "Clientes y Proveedores",
            "queries": [
                "¿Cuántos clientes tengo registrados?",
                "¿Qué proveedores están activos?",
                "¿Cuál es la información del cliente Sears?",
                "¿Dónde están ubicados mis proveedores?"
            ]
        },
        {
            "category": "Aduanas",
            "queries": [
                "¿Qué aduanas están disponibles?",
                "¿Cuáles son los requisitos para la aduana de Tijuana?",
                "¿Qué documentos necesito para importar?",
                "¿Cuáles son los aranceles aplicables?"
            ]
        },
        {
            "category": "Regulaciones",
            "queries": [
                "¿Qué documentos necesito para exportar?",
                "¿Cuáles son los requisitos del SAT?",
                "¿Qué es el código HS y cómo se usa?",
                "¿Cuáles son los tratados comerciales vigentes?"
            ]
        }
    ]
    
    return {"suggestions": suggestions}

@router.get("/health")
async def health_check():
    """
    Verificar estado del chatbot
    """
    try:
        agent = get_chatbot_agent()
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "active_sessions": len(conversation_storage),
            "model": "gpt-4o-mini"
        }
    except Exception as e:
        logger.error(f"Error en health check: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

async def log_conversation(
    session_id: str,
    user_message: str,
    agent_response: str,
    user_context: UserContext
):
    """
    Log de conversación para análisis posterior
    """
    try:
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
            "user_id": user_context.user_id,
            "user_type": user_context.user_type,
            "current_page": user_context.current_page,
            "user_message": user_message,
            "agent_response": agent_response,
            "response_length": len(agent_response)
        }
        
        # Aquí podrías guardar en una base de datos o sistema de logging
        logger.info(f"Conversation log: {json.dumps(log_entry)}")
        
    except Exception as e:
        logger.error(f"Error logging conversation: {e}")

# Endpoints adicionales para funcionalidades específicas

@router.post("/analyze-operation")
async def analyze_operation(
    operation_code: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Analizar una operación específica con el agente mejorado
    """
    try:
        agent = get_enhanced_chatbot_agent()
        
        # Crear contexto específico para análisis de operación
        user_context = EnhancedUserContext(
            user_id=current_user["id"],
            user_type=current_user.get("user_type", "siem"),
            current_page="/operations",
            session_id=f"analysis_{operation_code}_{int(datetime.now().timestamp())}",
            last_activity=datetime.now().isoformat()
        )
        
        # Consulta específica para análisis
        messages = [{
            "role": "user",
            "content": f"Analiza la operación {operation_code} y proporciona un resumen detallado de su estado, fechas importantes, documentos pendientes y próximos pasos."
        }]
        
        response = await agent.process_chat(messages, user_context)
        
        return {
            "operation_code": operation_code,
            "analysis": response.response,
            "structured_data": response.structured_data,
            "confidence": response.confidence,
            "suggested_actions": response.suggested_actions,
            "follow_up_questions": response.follow_up_questions,
            "entities_extracted": response.entities_extracted,
            "memory_used": response.memory_used,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analizando operación: {e}")
        raise HTTPException(status_code=500, detail="Error analizando operación")

@router.post("/generate-report")
async def generate_report(
    report_type: str,
    filters: Optional[Dict[str, Any]] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generar reporte basado en datos del sistema
    """
    try:
        agent = get_chatbot_agent()
        
        user_context = UserContext(
            user_id=current_user["id"],
            user_type=current_user.get("user_type", "siem"),
            current_page="/reporting",
            session_id=f"report_{report_type}_{int(datetime.now().timestamp())}"
        )
        
        # Consulta para generar reporte
        messages = [{
            "role": "user",
            "content": f"Genera un reporte de {report_type} con los siguientes filtros: {filters or 'sin filtros específicos'}. Incluye estadísticas, tendencias y recomendaciones."
        }]
        
        response = await agent.process_chat(messages, user_context)
        
        return {
            "report_type": report_type,
            "filters": filters,
            "content": response.response,
            "confidence": response.confidence,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generando reporte: {e}")
        raise HTTPException(status_code=500, detail="Error generando reporte")

@router.post("/deepchat")
async def deepchat_endpoint(
    request: DeepChatRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user_optional),
    credentials_opt: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)
):
    """
    Endpoint específico para Deep Chat que maneja el formato {messages: MessageContent[]}
    """
    try:
        # Obtener agente mejorado
        agent = get_enhanced_chatbot_agent()
        
        # Extraer el último mensaje del usuario
        if not request.messages:
            return {"text": "No se recibió ningún mensaje"}
        
        last_message = request.messages[-1]
        if last_message.role != "user":
            return {"text": "El último mensaje debe ser del usuario"}

        
        # Crear contexto del usuario
        resolved_user_type = (
            request.context.get("user_type")
            if request.context and request.context.get("user_type")
            else current_user.get("user_type", "client")
        )

        user_context = EnhancedUserContext(
            user_id=request.user_id or current_user["id"],
            user_type=resolved_user_type,
            current_page=request.context.get("current_page", "/") if request.context else "/",
            session_id=f"deepchat_{current_user['id']}_{int(datetime.now().timestamp())}",
            preferences=request.context.get("preferences") if request.context else None,
            last_activity=datetime.now().isoformat()
        )
        
        # Intento 1: enrutamiento dinámico a APIs reales con resumen en texto plano
        last_text = last_message.text
        try:
            base_url = os.getenv('SIEM_API_BASE_URL', 'http://localhost:8000')
            page_hint = user_context.current_page
            candidates = _choose_candidates(last_text, top_k=5, page_hint=page_hint)
            if candidates and credentials_opt and credentials_opt.credentials:
                plan = _plan_with_llm(last_text, candidates, user_params=None)
                ep_idx = plan.get("endpoint_index")
                if ep_idx is None or not isinstance(ep_idx, int) or ep_idx < 0 or ep_idx >= len(candidates):
                    ep_idx = 0
                chosen = candidates[ep_idx]
                params = _normalize_params(plan.get("params") or {}, provided=None, user_query=last_text)
                built = _build_url(base_url, chosen, params)
                missing = built.get("missing", [])
                if not missing:
                    headers = {
                        "Authorization": f"Bearer {credentials_opt.credentials}",
                        "Accept": "application/json"
                    }
                    method = chosen.get("method", "GET").upper()
                    url = built["url"]
                    query = built.get("query", {})
                    try:
                        if method == "GET":
                            resp = requests.get(url, headers=headers, params=query, timeout=20)
                        elif method == "POST":
                            resp = requests.post(url, headers=headers, json=query or {}, timeout=20)
                        elif method in ("PUT", "PATCH"):
                            resp = requests.request(method, url, headers=headers, json=query or {}, timeout=20)
                        elif method == "DELETE":
                            resp = requests.delete(url, headers=headers, params=query, timeout=20)
                        else:
                            resp = None
                    except Exception:
                        resp = None

                    if resp is not None:
                        try:
                            result = resp.json()
                        except Exception:
                            result = resp.text
                        answer = _summarize_plain_text(last_text, chosen, result)

                        # Log conversación con la respuesta derivada de API
                        background_tasks.add_task(
                            log_conversation,
                            user_context.session_id,
                            last_text,
                            answer,
                            user_context
                        )
                        return {"text": answer}
        except Exception as _:
            # Cualquier error en el flujo de API dinámica: caer al agente
            pass

        # Intento 2: Agente mejorado (fallback)
        messages = [{"role": msg.role, "content": msg.text} for msg in request.messages]
        response = await agent.process_chat(messages, user_context)
        
        # Log de la conversación
        background_tasks.add_task(
            log_conversation,
            user_context.session_id,
            last_message.text,
            response.response,
            user_context
        )
        
        # Responder siempre en texto plano
        return {"text": response.response}
        
    except Exception as e:
        logger.error(f"Error en deepchat endpoint: {str(e)}")
        return {
            "error": f"Error al procesar la consulta: {str(e)}"
        }
