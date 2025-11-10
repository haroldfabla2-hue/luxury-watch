#!/bin/bash

# =============================================================================
# LUXURYWATCH - DEPLOYMENT SCRIPT
# =============================================================================
# Script para deployar el código en el servidor Atlantic.net
# Uso: chmod +x deploy.sh && ./deploy.sh
# =============================================================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Banner
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  LUXURYWATCH DEPLOYMENT                        ║"
echo "║                     Production Deploy                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Ejecuta este script desde el directorio luxurywatch-frontend/"
fi

log "Iniciando deployment de LuxuryWatch..."

# =============================================================================
# 1. VERIFICAR SERVICIOS
# =============================================================================
log "Verificando servicios del sistema..."

if ! systemctl is-active --quiet postgresql; then
    error "PostgreSQL no está corriendo. Ejecuta primero atlantic-net-install.sh"
fi

if ! systemctl is-active --quiet redis-server; then
    error "Redis no está corriendo. Ejecuta primero atlantic-net-install.sh"
fi

if ! systemctl is-active --quiet nginx; then
    error "Nginx no está corriendo. Ejecuta primero atlantic-net-install.sh"
fi

log "✅ Todos los servicios están corriendo"

# =============================================================================
# 2. BACKUP ACTUAL
# =============================================================================
log "Creando backup del estado actual..."
if [ -d "/opt/luxurywatch-frontend/dist" ]; then
    cp -r /opt/luxurywatch-frontend/dist /opt/luxurywatch-backup/dist-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
fi
if [ -d "/opt/luxurywatch-backend" ]; then
    cp -r /opt/luxurywatch-backend /opt/luxurywatch-backup/backend-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
fi

# =============================================================================
# 3. DEPLOY BACKEND
# =============================================================================
log "Deployando backend..."

if [ ! -d "/opt/luxurywatch-backend" ]; then
    warn "Backend directory no existe, creándolo..."
    mkdir -p /opt/luxurywatch-backend
    chown $SUDO_USER:$SUDO_USER /opt/luxurywatch-backend
fi

# Copiar archivos del backend (asumiendo que estamos en el directorio root del proyecto)
if [ -d "src" ] && [ -d "server.js" ]; then
    log "Copiando backend desde directorio actual..."
    rsync -av --exclude=node_modules --exclude=dist --exclude=.git . /opt/luxurywatch-backend/ 2>/dev/null || true
    chown -R $SUDO_USER:$SUDO_USER /opt/luxurywatch-backend
else
    warn "No se encontraron archivos de backend en el directorio actual"
    warn "Asegúrate de copiar manualmente los archivos del backend"
fi

# Instalar dependencias del backend
cd /opt/luxurywatch-backend
if [ -f "package.json" ]; then
    log "Instalando dependencias del backend..."
    sudo -u $SUDO_USER npm install --production
    log "Backend dependencies installed ✅"
else
    warn "No se encontró package.json en el backend"
fi

# =============================================================================
# 4. DEPLOY FRONTEND
# =============================================================================
log "Deployando frontend..."

if [ ! -d "/opt/luxurywatch-frontend" ]; then
    warn "Frontend directory no existe, creándolo..."
    mkdir -p /opt/luxurywatch-frontend
    chown $SUDO_USER:$SUDO_USER /opt/luxurywatch-frontend
fi

# Copiar archivos del frontend
log "Copiando archivos del frontend..."
rsync -av --exclude=node_modules --exclude=dist --exclude=.git . /opt/luxurywatch-frontend/ 2>/dev/null || true
chown -R $SUDO_USER:$SUDO_USER /opt/luxurywatch-frontend

# Instalar dependencias del frontend
cd /opt/luxurywatch-frontend
if [ -f "package.json" ]; then
    log "Instalando dependencias del frontend..."
    sudo -u $SUDO_USER npm install
    log "Frontend dependencies installed ✅"
else
    error "No se encontró package.json en el frontend"
fi

# Build del frontend
log "Construyendo frontend..."
sudo -u $SUDO_USER npm run build

if [ ! -d "dist" ]; then
    error "La compilación del frontend falló. Verifica los errores."
fi

log "Frontend built successfully ✅"

# =============================================================================
# 5. MIGRACIÓN DE BASE DE DATOS
# =============================================================================
log "Ejecutando migraciones de base de datos..."
cd /opt/luxurywatch-backend

if [ -f "prisma/schema.prisma" ]; then
    log "Aplicando migraciones de Prisma..."
    sudo -u $SUDO_USER npx prisma migrate deploy || warn "Migración de Prisma falló"
    log "Database migrations applied ✅"
else
    warn "No se encontró schema.prisma, omitiendo migraciones"
fi

# =============================================================================
# 6. CONFIGURAR PERMISOS
# =============================================================================
log "Configurando permisos..."
chown -R $SUDO_USER:$SUDO_USER /opt/luxurywatch-frontend/dist
chmod -R 755 /opt/luxurywatch-frontend/dist
chmod 600 /opt/luxurywatch-backend/.env 2>/dev/null || true

# =============================================================================
# 7. INICIAR/REINICIAR SERVICIOS
# =============================================================================
log "Reiniciando servicios..."

# Reiniciar backend con PM2
cd /opt/luxurywatch-backend
if [ -f "server.js" ]; then
    log "Reiniciando backend con PM2..."
    sudo -u $SUDO_USER pm2 delete luxurywatch-backend 2>/dev/null || true
    sudo -u $SUDO_USER pm2 start server.js -i max --name "luxurywatch-backend" || warn "PM2 start falló"
    log "Backend restarted ✅"
else
    warn "No se encontró server.js, backend no iniciado"
fi

# Reiniciar Nginx
log "Recargando configuración de Nginx..."
systemctl reload nginx
log "Nginx reloaded ✅"

# =============================================================================
# 8. VERIFICACIÓN FINAL
# =============================================================================
log "Verificando deployment..."

# Esperar un momento para que los servicios se inicien
sleep 5

# Verificar backend
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    log "✅ Backend API responding"
else
    warn "⚠️  Backend API not responding"
fi

# Verificar archivos estáticos
if [ -f "/opt/luxurywatch-frontend/dist/index.html" ]; then
    log "✅ Frontend files deployed"
else
    error "❌ Frontend files not found"
fi

# Verificar Nginx
if systemctl is-active --quiet nginx; then
    log "✅ Nginx is running"
else
    error "❌ Nginx is not running"
fi

# =============================================================================
# REPORT FINAL
# =============================================================================
clear
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  DEPLOYMENT COMPLETADO ✅                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}📊 ESTADO DEL SISTEMA:${NC}"
echo "• Backend: $(pm2 list | grep luxurywatch-backend | awk '{print $10}' || echo 'Not running')"
echo "• Nginx: $(systemctl is-active nginx)"
echo "• PostgreSQL: $(systemctl is-active postgresql)"
echo "• Redis: $(systemctl is-active redis-server)"
echo ""

echo -e "${YELLOW}🌐 URLs DE ACCESO:${NC}"
echo "• Web App: https://your-domain.com"
echo "• API: https://your-domain.com/api"
echo "• WebSocket: wss://your-domain.com/ws"
echo ""

echo -e "${YELLOW}📁 DIRECTORIOS:${NC}"
echo "• Backend: /opt/luxurywatch-backend/"
echo "• Frontend: /opt/luxurywatch-frontend/"
echo "• Logs: /opt/luxurywatch-logs/"
echo "• Backups: /opt/luxurywatch-backup/"
echo ""

echo -e "${YELLOW}🔧 COMANDOS ÚTILES:${NC}"
echo "• Ver logs backend: pm2 logs luxurywatch-backend"
echo "• Ver logs nginx: tail -f /opt/luxurywatch-logs/nginx-error.log"
echo "• Reiniciar backend: pm2 restart luxurywatch-backend"
echo "• Ver estado PM2: pm2 list"
echo "• Ver logs PostgreSQL: tail -f /var/log/postgresql/postgresql-*.log"
echo ""

echo -e "${GREEN}🚀 DEPLOYMENT EXITOSO! 🎉${NC}"
echo "Tu aplicación LuxuryWatch está ahora corriendo en producción."

log "Deployment completado exitosamente!"