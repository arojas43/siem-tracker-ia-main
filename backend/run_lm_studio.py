#!/usr/bin/env python3
"""
Script para ejecutar el backend del chatbot con LM Studio
"""

import os
import sys
import subprocess
from pathlib import Path

def setup_environment():
    """Configurar variables de entorno para LM Studio"""
    env_vars = {
        'LM_STUDIO_URL': 'http://localhost:1234',
        # Modelo ligero para pruebas locales (usar el cargado en LM Studio)
        # Puedes cambiarlo por otro desde la variable de entorno LM_STUDIO_MODEL
        # Ejemplo sugerido: Phi-3.5-mini-instruct (quant Q4_K_S)
        'LM_STUDIO_MODEL': 'Phi-3.5-mini-instruct-Q4_K_S.gguf',
        'SIEM_API_BASE_URL': 'http://localhost:8000',
        'SIEM_API_TOKEN': 'dummy-token',
        'HOST': '0.0.0.0',
        'PORT': '8001',
        'ENVIRONMENT': 'development',
        'LOG_LEVEL': 'INFO'
    }
    
    for key, value in env_vars.items():
        os.environ[key] = value
        print(f"✅ {key}={value}")

def check_lm_studio():
    """Verificar que LM Studio esté funcionando"""
    import requests
    
    try:
        response = requests.get('http://localhost:1234/v1/models', timeout=5)
        if response.status_code == 200:
            print("✅ LM Studio está funcionando correctamente")
            return True
        else:
            print(f"❌ LM Studio responde con código {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ No se puede conectar a LM Studio: {e}")
        print("💡 Asegúrate de que LM Studio esté ejecutándose en http://localhost:1234")
        return False

def main():
    """Función principal"""
    print("🚀 Iniciando backend del chatbot SIEM con LM Studio...")
    
    # Configurar variables de entorno
    setup_environment()
    
    # Verificar LM Studio
    if not check_lm_studio():
        print("\n❌ No se puede continuar sin LM Studio")
        print("📋 Pasos para solucionar:")
        print("1. Abre LM Studio")
        print("2. Carga el modelo Phi-3.5-mini-instruct-Q4_K_S.gguf (o equivalente)")
        print("3. Inicia el servidor en el puerto 1234")
        print("4. Ejecuta este script nuevamente")
        sys.exit(1)
    
    # Ejecutar uvicorn
    print("\n🌐 Iniciando servidor FastAPI...")
    try:
        subprocess.run([
            sys.executable, '-m', 'uvicorn', 
            'main:app', 
            '--reload', 
            '--host', '0.0.0.0', 
            '--port', '8001'
        ])
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error ejecutando servidor: {e}")

if __name__ == "__main__":
    main()
