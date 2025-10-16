import os
import argparse
import glob
from typing import List

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma


def discover_pdfs(input_dir: str) -> List[str]:
    input_dir = os.path.abspath(input_dir)
    pattern = os.path.join(input_dir, "**", "*.pdf")
    return sorted(glob.glob(pattern, recursive=True))


def load_documents(pdf_paths: List[str], input_dir: str):
    docs = []
    for pdf_path in pdf_paths:
        try:
            loader = PyPDFLoader(pdf_path)
            loaded = loader.load()
            # Ensure metadata includes filename for nicer source rendering
            for d in loaded:
                d.metadata["filename"] = os.path.basename(pdf_path)
                # Visibilidad/propietario por ruta: backend/docs/users/<user_id>/...
                try:
                    rel_path = os.path.relpath(pdf_path, start=os.path.abspath(input_dir))
                    parts = rel_path.split(os.sep)
                    if len(parts) >= 2 and parts[0].lower() == "users":
                        d.metadata["user_id"] = parts[1]
                        d.metadata["visibility"] = "user"
                    else:
                        d.metadata["visibility"] = "global"
                except Exception:
                    d.metadata["visibility"] = "global"
            docs.extend(loaded)
        except Exception as e:
            print(f"[WARN] No se pudo cargar '{pdf_path}': {e}")
    return docs


def chunk_documents(docs):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n", "\n", " ", ""],
    )
    return splitter.split_documents(docs)


def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    default_docs_dir = os.path.join(base_dir, "docs")
    default_vectorstore_dir = os.path.join(base_dir, "vectorstore")

    parser = argparse.ArgumentParser(description="Ingesta de documentos PDF en Chroma")
    parser.add_argument("--input", default=os.getenv("DOCS_DIR", default_docs_dir), help="Directorio de documentos (PDF)")
    parser.add_argument("--persist", default=os.getenv("VECTORSTORE_DIR", default_vectorstore_dir), help="Directorio de persistencia de Chroma")
    parser.add_argument("--model", default=os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"), help="Modelo de embeddings de Sentence Transformers")
    parser.add_argument("--refresh", action="store_true", help="Recrear índice (elimina y vuelve a crear)")
    args = parser.parse_args()

    os.makedirs(args.persist, exist_ok=True)
    os.makedirs(args.input, exist_ok=True)

    pdfs = discover_pdfs(args.input)
    if not pdfs:
        print(f"[INFO] No se encontraron PDFs en '{args.input}'. Nada que indexar.")
        return

    print(f"[INFO] Encontrados {len(pdfs)} PDFs. Cargando páginas...")
    docs = load_documents(pdfs, args.input)
    print(f"[INFO] Cargadas {len(docs)} páginas. Realizando chunking...")
    chunks = chunk_documents(docs)
    print(f"[INFO] Generados {len(chunks)} chunks. Construyendo embeddings con '{args.model}'...")

    embeddings = SentenceTransformerEmbeddings(model_name=args.model)

    if args.refresh and os.path.isdir(args.persist):
        # Limpia el directorio de persistencia si se solicita refresh
        for root, dirs, files in os.walk(args.persist, topdown=False):
            for name in files:
                try:
                    os.remove(os.path.join(root, name))
                except Exception:
                    pass
            for name in dirs:
                try:
                    os.rmdir(os.path.join(root, name))
                except Exception:
                    pass
        print(f"[INFO] Directorio de persistencia limpiado: {args.persist}")

    db = Chroma.from_documents(chunks, embeddings, persist_directory=args.persist)
    db.persist()
    print(f"[OK] Índice persistido en '{args.persist}'. Total de chunks indexados: {len(chunks)}")


if __name__ == "__main__":
    main()