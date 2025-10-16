Este directorio contiene los documentos (principalmente PDFs) que se indexarán
para el RAG del chatbot. Puedes crear subcarpetas libremente.

Estructura sugerida para control de acceso:

- `backend/docs/global/`: documentos accesibles para todos.
- `backend/docs/users/<user_id>/`: documentos privados de cada usuario.

Ejecuta la ingesta:

    venv\Scripts\python.exe backend\rag\ingest_documents.py --input backend\docs --persist backend\vectorstore