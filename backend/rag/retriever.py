import os
from functools import lru_cache
from typing import List

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.schema import Document


@lru_cache(maxsize=1)
def _get_embeddings():
    model_name = os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    return SentenceTransformerEmbeddings(model_name=model_name)


@lru_cache(maxsize=1)
def get_vectorstore() -> Chroma:
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    persist_dir = os.getenv("VECTORSTORE_DIR", os.path.join(base_dir, "vectorstore"))
    embeddings = _get_embeddings()
    return Chroma(persist_directory=persist_dir, embedding_function=embeddings)


def get_retriever(search_type: str = None, k: int = None, metadata_filter: dict | None = None):
    search_type = search_type or os.getenv("RETRIEVAL_SEARCH_TYPE", "mmr")
    k = k or int(os.getenv("RETRIEVAL_TOP_K", "4"))
    # Usar MMR por defecto para diversidad de resultados
    kwargs = {"k": k}
    if search_type == "mmr":
        kwargs["fetch_k"] = max(k * 3, 20)
    if metadata_filter:
        kwargs["filter"] = metadata_filter
    return get_vectorstore().as_retriever(search_type=search_type, search_kwargs=kwargs)


def search_documents(query: str, metadata_filter: dict | None = None, search_type: str | None = None, k: int | None = None):
    """Búsqueda directa en el vectorstore con filtro dinámico por metadata."""
    search_type = search_type or os.getenv("RETRIEVAL_SEARCH_TYPE", "mmr")
    k = k or int(os.getenv("RETRIEVAL_TOP_K", "4"))
    vs = get_vectorstore()
    if search_type == "mmr":
        fetch_k = max(k * 3, 20)
        return vs.max_marginal_relevance_search(query, k=k, fetch_k=fetch_k, filter=metadata_filter)
    else:
        return vs.similarity_search(query, k=k, filter=metadata_filter)


def extract_sources(docs: List[Document]) -> List[str]:
    sources = []
    for d in docs:
        src = d.metadata.get("source") or d.metadata.get("filename") or ""
        page = d.metadata.get("page")
        label = os.path.basename(src) if src else ""
        if page is not None:
            label = f"{label} (p.{page})" if label else f"p.{page}"
        if label:
            sources.append(label)
    # Unicos preservando orden
    seen = set()
    uniq = []
    for s in sources:
        if s not in seen:
            uniq.append(s)
            seen.add(s)
    return uniq