#!/usr/bin/env python3
"""
Script para probar la conexión entre WhatsApp Bot y API del chatbot
"""

import requests
import json
import sys

def test_chatbot_api():
    """Probar la API del chatbot sin autenticación"""
    base_url = "http://localhost:8000"
    
    print("🧪 Probando conexión con API del chatbot...")
    
    # Probar health check
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"✅ Health check: {response.status_code}")
        print(f"📊 Respuesta: {response.json()}")
    except Exception as e:
        print(f"❌ Error en health check: {e}")
        return False
    
    # Probar endpoint de chat sin autenticación
    try:
        chat_data = {
            "message": "Hola, ¿cómo estás?",
            "user_id": "test_user",
            "context": {
                "user_type": "client",
                "current_page": "/whatsapp"
            },
            "session_id": "test_session_123"
        }
        
        response = requests.post(
            f"{base_url}/api/chatbot/chat",
            json=chat_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"✅ Chat endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"📝 Respuesta: {data.get('response', 'Sin respuesta')[:100]}...")
            print(f"🤖 Modelo: {data.get('model_used', 'N/A')}")
            print(f"🎯 Confianza: {data.get('confidence', 'N/A')}")
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en chat endpoint: {e}")
        return False
    
    return True

def test_whatsapp_bot():
    """Probar el bot de WhatsApp"""
    base_url = "http://localhost:3001"
    
    print("\n🤖 Probando bot de WhatsApp...")
    
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"✅ WhatsApp Bot health: {response.status_code}")
        print(f"📊 Respuesta: {response.json()}")
    except Exception as e:
        print(f"❌ Error en WhatsApp Bot: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Iniciando pruebas de conexión...")
    
    # Probar API del chatbot
    chatbot_ok = test_chatbot_api()
    
    # Probar bot de WhatsApp
    whatsapp_ok = test_whatsapp_bot()
    
    print("\n📊 Resumen de pruebas:")
    print(f"API Chatbot: {'✅ OK' if chatbot_ok else '❌ ERROR'}")
    print(f"WhatsApp Bot: {'✅ OK' if whatsapp_ok else '❌ ERROR'}")
    
    if chatbot_ok and whatsapp_ok:
        print("\n🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.")
        sys.exit(0)
    else:
        print("\n💥 Algunas pruebas fallaron. Revisa los errores arriba.")
        sys.exit(1)
