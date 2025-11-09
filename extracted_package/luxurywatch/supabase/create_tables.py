#!/usr/bin/env python3
"""
Script para crear las tablas del configurador de relojes en Supabase
"""

import requests
import json

# Credenciales de Supabase
SUPABASE_URL = "https://flxzobqtrdpnbiqpmjlc.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseHpvYnF0cmRwbmJpcXBtamxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDEzMTAsImV4cCI6MjA3NzcxNzMxMH0.kDyVg7X4veHaOi24P-Jg0E9SuSy06XHSzwALtY6UoO0"

def create_table(table_name, table_schema):
    """Crear una tabla usando REST API"""
    url = f"{SUPABASE_URL}/rest/v1/"
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    try:
        # Para crear tablas necesitamos usar el endpoint de SQL directamente
        sql_endpoint = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
        response = requests.post(sql_endpoint, headers=headers, json={"sql": table_schema})
        
        if response.status_code in [200, 201]:
            print(f"✅ Tabla '{table_name}' creada exitosamente")
            return True
        else:
            print(f"❌ Error creando tabla '{table_name}': {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando SQL para tabla '{table_name}': {str(e)}")
        return False

def execute_sql_file(file_path):
    """Ejecutar un archivo SQL"""
    with open(file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Dividir el SQL en comandos individuales
    sql_commands = []
    current_command = []
    
    for line in sql_content.split('\n'):
        line = line.strip()
        if not line or line.startswith('--'):
            continue
            
        current_command.append(line)
        
        # Si la línea termina con punto y coma, es el final del comando
        if line.endswith(';'):
            sql_commands.append(' '.join(current_command))
            current_command = []
    
    # Ejecutar cada comando
    success_count = 0
    for i, command in enumerate(sql_commands, 1):
        if command.strip():
            print(f"Ejecutando comando {i}/{len(sql_commands)}...")
            if execute_single_sql(command):
                success_count += 1
            else:
                print(f"Fallo en comando {i}: {command[:100]}...")
    
    return success_count == len(sql_commands)

def execute_single_sql(sql_command):
    """Ejecutar un solo comando SQL"""
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        # Usar el endpoint de SQL de Supabase
        url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
        response = requests.post(url, headers=headers, json={"sql": sql_command})
        
        return response.status_code in [200, 201, 204]
        
    except Exception as e:
        print(f"Error ejecutando SQL: {str(e)}")
        return False

def test_connection():
    """Probar la conexión a Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status de conexión: {response.status_code}")
        if response.status_code == 200:
            print("✅ Conexión a Supabase exitosa")
            return True
        else:
            print(f"❌ Error de conexión: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return False

def main():
    print("🚀 Iniciando creación de tablas del configurador de relojes...")
    
    # Probar conexión
    if not test_connection():
        print("❌ No se pudo conectar a Supabase. Verifica las credenciales.")
        return False
    
    print("\n📋 Ejecutando scripts SQL...")
    
    # Ejecutar creación de tablas
    print("\n1. Creando tablas...")
    if not execute_sql_file("/workspace/luxurywatch/supabase/01_create_watch_tables.sql"):
        print("❌ Error creando tablas")
        return False
    
    print("\n2. Insertando datos...")
    if not execute_sql_file("/workspace/luxurywatch/supabase/02_insert_watch_data.sql"):
        print("❌ Error insertando datos")
        return False
    
    print("\n✅ ¡Todas las tablas creadas y pobladas exitosamente!")
    
    # Verificar que las tablas existen
    print("\n🔍 Verificando tablas...")
    verify_tables()
    
    return True

def verify_tables():
    """Verificar que las tablas existen y tienen datos"""
    tables = ['materials', 'cases', 'dials', 'hands', 'straps']
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    
    for table in tables:
        try:
            url = f"{SUPABASE_URL}/rest/v1/{table}?select=count"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else 0
                print(f"✅ Tabla '{table}': {count} registros")
            else:
                print(f"❌ Error verificando tabla '{table}': {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error verificando tabla '{table}': {str(e)}")

if __name__ == "__main__":
    main()