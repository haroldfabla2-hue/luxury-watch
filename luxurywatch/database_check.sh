#!/bin/bash
# Script para verificar bases de datos disponibles
# Ejecutar en tu servidor para encontrar bases de datos activas

echo "=== VERIFICACIÓN DE BASES DE DATOS ==="
echo

# 1. Verificar PostgreSQL
echo "🐘 POSTGRESQL:"
if command -v psql &> /dev/null; then
    echo "✅ Cliente PostgreSQL instalado"
    if systemctl is-active --quiet postgresql; then
        echo "✅ Servicio PostgreSQL activo"
        echo "Versión: $(psql --version | awk '{print $3}')"
    else
        echo "⚠️ PostgreSQL instalado pero no activo"
    fi
fi
echo

# 2. Verificar MySQL/MariaDB
echo "🗄️ MYSQL/MARIADB:"
if command -v mysql &> /dev/null; then
    echo "✅ Cliente MySQL instalado"
    if systemctl is-active --quiet mysql || systemctl is-active --quiet mariadb; then
        echo "✅ Servicio MySQL/MariaDB activo"
    else
        echo "⚠️ MySQL/MariaDB instalado pero no activo"
    fi
fi
echo

# 3. Verificar bases de datos externas comunes
echo "🌐 BASES DE DATOS EXTERNAS COMUNES:"
echo "Verificando servicios de hosting comunes..."

# Atlantic.net - verificar puerto común
echo "Atlantic.net (puerto 5432):"
if timeout 3 bash -c "</dev/tcp/$(hostname -I | awk '{print $1}')/5432" 2>/dev/null; then
    echo "⚠️ Puerto 5432 (PostgreSQL) disponible en localhost"
else
    echo "ℹ️ Puerto 5432 (PostgreSQL) no disponible en localhost"
fi

# Verificar si hay variables de entorno con URLs de base de datos
echo
echo "Variables de entorno de base de datos encontradas:"
env | grep -i "database\|db_\|dburl\|postgres\|mysql" | grep -v "DOCKER" || echo "No se encontraron variables de BD"
echo

# 4. Verificar Redis
echo "🔴 REDIS:"
if command -v redis-cli &> /dev/null; then
    echo "✅ Cliente Redis instalado"
    if systemctl is-active --quiet redis || systemctl is-active --quiet redis-server; then
        echo "✅ Servicio Redis activo"
    fi
fi
echo

# 5. Intentar conectar a bases de datos comunes
echo "🔌 PRUEBA DE CONEXIÓN:"
echo "Intentando conectar a servicios comunes..."

# Atlantic.net typical connection test
echo "Probando conexión a localhost:3306 (MySQL)..."
timeout 3 bash -c "</dev/tcp/localhost/3306" 2>/dev/null && echo "✅ Puerto MySQL disponible" || echo "❌ Puerto MySQL no disponible"

echo "Probando conexión a localhost:5432 (PostgreSQL)..."
timeout 3 bash -c "</dev/tcp/localhost/5432" 2>/dev/null && echo "✅ Puerto PostgreSQL disponible" || echo "❌ Puerto PostgreSQL no disponible"

echo
echo "=== INFORMACIÓN DE CONEXIÓN ==="
echo "Si tienes una base de datos externa como Atlantic.net, necesitarás:"
echo "1. Host de la base de datos"
echo "2. Puerto (usualmente 5432 para PostgreSQL o 3306 para MySQL)"
echo "3. Nombre de la base de datos"
echo "4. Usuario y contraseña"
echo
echo "=== FIN DE VERIFICACIÓN DE BD ==="