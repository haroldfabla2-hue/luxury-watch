#!/bin/bash
# Script para auditar la configuración del servidor
# Ejecutar en tu servidor para obtener información de configuración

echo "=== CONFIGURACIÓN DEL SERVIDOR DOCKER ==="
echo

# 1. Verificar Docker
echo "🐳 VERIFICANDO DOCKER:"
if command -v docker &> /dev/null; then
    echo "✅ Docker está instalado"
    docker --version
else
    echo "❌ Docker no está instalado"
fi
echo

# 2. Verificar docker-compose
echo "📦 VERIFICANDO DOCKER-COMPOSE:"
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker-compose está instalado"
    docker-compose --version
elif docker compose version &> /dev/null; then
    echo "✅ Docker compose plugin está instalado"
    docker compose version
else
    echo "❌ Docker-compose no está instalado"
fi
echo

# 3. Verificar contenedores activos
echo "📋 CONTENEDORES ACTIVOS:"
echo "Puerto | Contenedor | Estado"
echo "-------|------------|--------"
docker ps --format "table {{.Ports}}\t{{.Names}}\t{{.Status}}" | grep -v "CONTAINER ID"
echo

# 4. Verificar puertos en uso
echo "🔌 PUERTOS EN USO:"
netstat -tulpn | grep LISTEN | awk '{print $4}' | cut -d':' -f2 | sort -n | uniq | head -20
echo

# 5. Verificar proxy inverso (nginx)
echo "🌐 VERIFICANDO PROXY INVERSO:"
if command -v nginx &> /dev/null; then
    echo "✅ Nginx está instalado"
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx está activo"
        nginx -t
    else
        echo "⚠️ Nginx está instalado pero no activo"
    fi
else
    echo "❌ Nginx no está instalado"
fi
echo

# 6. Verificar variables de entorno comunes
echo "🔐 VERIFICANDO VARIABLES DE ENTORNO:"
echo "NEXTAUTH_URL=${NEXTAUTH_URL:-No definida}"
echo "DATABASE_URL=${DATABASE_URL:-No definida}"
echo "REDIS_URL=${REDIS_URL:-No definida}"
echo

# 7. Verificar dominios configurados
echo "🌍 VERIFICANDO DOMINIOS:"
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    grep "server_name" /etc/nginx/sites-enabled/default | head -5
fi
if [ -f "/etc/nginx/nginx.conf" ]; then
    grep "server_name" /etc/nginx/nginx.conf | head -5
fi
echo

# 8. Verificar SSL
echo "🔒 VERIFICANDO SSL:"
if command -v certbot &> /dev/null; then
    echo "✅ Certbot está instalado"
    certbot certificates 2>/dev/null | grep "Certificate Name" | head -3
fi
echo

# 9. Información del sistema
echo "🖥️ INFORMACIÓN DEL SISTEMA:"
echo "OS: $(uname -a)"
echo "Disco: $(df -h / | tail -1 | awk '{print $1 " - " $3 "/" $2 " usado"}')"
echo "Memoria: $(free -h | grep Mem | awk '{print $3 "/" $2 " usado"}')"
echo

echo "=== FIN DE LA AUDITORÍA ==="
echo "Guarda esta salida y compártela para configurar la aplicación."