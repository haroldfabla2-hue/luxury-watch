#!/bin/bash

# =============================================================================
# LUXURYWATCH - ATLANTIC.NET INSTALLATION SCRIPT
# =============================================================================
# Este script instala y configura toda la infraestructura de LuxuryWatch
# en un servidor Atlantic.net
# 
# Uso: chmod +x atlantic-net-install.sh && ./atlantic-net-install.sh
# =============================================================================

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
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
echo "║                Atlantic.net Installation                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    error "Por favor ejecuta este script como root (usa sudo)"
fi

log "Iniciando instalación de LuxuryWatch en Atlantic.net..."

# =============================================================================
# 1. ACTUALIZACIÓN DEL SISTEMA
# =============================================================================
log "Actualizando sistema..."
apt update && apt upgrade -y

# =============================================================================
# 2. INSTALACIÓN DE DEPENDENCIAS BÁSICAS
# =============================================================================
log "Instalando dependencias básicas..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# =============================================================================
# 3. INSTALACIÓN DE NODE.JS
# =============================================================================
log "Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar instalación
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "Node.js instalado: $NODE_VERSION"
log "NPM instalado: $NPM_VERSION"

# =============================================================================
# 4. INSTALACIÓN DE POSTGRESQL
# =============================================================================
log "Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Iniciar y habilitar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Configurar usuario postgres
sudo -u postgres psql -c "CREATE USER luxurywatch WITH PASSWORD 'luxurywatch_db_2025!';" || true
sudo -u postgres psql -c "CREATE DATABASE luxurywatch_db OWNER luxurywatch;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE luxurywatch_db TO luxurywatch;" || true

log "PostgreSQL configurado correctamente"

# =============================================================================
# 5. INSTALACIÓN DE REDIS
# =============================================================================
log "Instalando Redis..."
apt install -y redis-server

# Configurar Redis
systemctl start redis-server
systemctl enable redis-server

log "Redis configurado correctamente"

# =============================================================================
# 6. INSTALACIÓN DE PM2
# =============================================================================
log "Instalando PM2..."
npm install -g pm2

log "PM2 instalado correctamente"

# =============================================================================
# 7. CREACIÓN DE DIRECTORIOS
# =============================================================================
log "Creando estructura de directorios..."
mkdir -p /opt/luxurywatch-backend
mkdir -p /opt/luxurywatch-frontend
mkdir -p /opt/luxurywatch-logs
mkdir -p /opt/luxurywatch-backup

# Configurar permisos
chown -R $SUDO_USER:$SUDO_USER /opt/luxurywatch-*
chmod -R 755 /opt/luxurywatch-*

# =============================================================================
# 8. INSTALACIÓN DE NGINX
# =============================================================================
log "Instalando Nginx..."
apt install -y nginx

# Iniciar y habilitar Nginx
systemctl start nginx
systemctl enable nginx

log "Nginx configurado correctamente"

# =============================================================================
# 9. CONFIGURACIÓN DE FIREWALL
# =============================================================================
log "Configurando firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

log "Firewall configurado correctamente"

# =============================================================================
# 10. INSTALACIÓN DE CERTBOT (LETSENCRYPT)
# =============================================================================
log "Instalando Certbot para SSL..."
apt install -y certbot python3-certbot-nginx

log "Certbot instalado correctamente"

# =============================================================================
# 11. CONFIGURACIÓN DE VARIABLES DE ENTORNO
# =============================================================================
log "Creando archivo de variables de entorno..."

cat > /opt/luxurywatch-backend/.env << EOF
# Database
DATABASE_URL=postgresql://luxurywatch:luxurywatch_db_2025!@localhost:5432/luxurywatch_db

# JWT
JWT_SECRET=luxurywatch_jwt_secret_2025_$(openssl rand -hex 32)

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=production

# AI Providers (debes configurar tus propias claves)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_AI_API_KEY=your_google_ai_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here

# Stripe (debes configurar tus claves)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS
CORS_ORIGIN=https://your-domain.com
EOF

chown $SUDO_USER:$SUDO_USER /opt/luxurywatch-backend/.env
chmod 600 /opt/luxurywatch-backend/.env

# =============================================================================
# 12. CREACIÓN DE SERVICIO SYSTEMD
# =============================================================================
log "Creando servicio systemd..."

cat > /etc/systemd/system/luxurywatch-backend.service << EOF
[Unit]
Description=LuxuryWatch Backend API
After=network.target

[Service]
Type=forking
User=$SUDO_USER
WorkingDirectory=/opt/luxurywatch-backend
Environment=NODE_ENV=production
EnvironmentFile=/opt/luxurywatch-backend/.env
ExecStart=/usr/bin/pm2 start server.js -i max --name "luxurywatch-backend"
ExecReload=/usr/bin/pm2 reload luxurywatch-backend
ExecStop=/usr/bin/pm2 stop luxurywatch-backend
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

# =============================================================================
# 13. CONFIGURACIÓN DE NGINX
# =============================================================================
log "Configurando Nginx..."

# Crear configuración principal
cat > /etc/nginx/sites-available/luxurywatch << EOF
# Configuración principal de LuxuryWatch
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirigir a HTTPS
    return 301 https://\$server_name\$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # Configuración SSL (se configurará con certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Configuración de seguridad SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Configuración de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Root directory para archivos estáticos
    root /opt/luxurywatch-frontend/dist;
    index index.html;
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket para chat
    location /ws/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Archivos estáticos de frontend
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Logs
    access_log /opt/luxurywatch-logs/nginx-access.log;
    error_log /opt/luxurywatch-logs/nginx-error.log;
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/luxurywatch /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Probar configuración
nginx -t

# Reiniciar Nginx
systemctl reload nginx

# =============================================================================
# 14. SCRIPT DE DEPLOYMENT
# =============================================================================
log "Creando script de deployment..."

cat > /opt/luxurywatch-deploy.sh << 'EOF'
#!/bin/bash
# Script de deployment para LuxuryWatch

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log "Iniciando deployment de LuxuryWatch..."

# Mover archivos del backend
if [ -d "/opt/luxurywatch-backend" ]; then
    log "Backend ya existe, actualizando..."
    cd /opt/luxurywatch-backend
    npm install
    npm run build
    pm2 restart luxurywatch-backend
else
    error "Backend no encontrado en /opt/luxurywatch-backend"
fi

# Mover archivos del frontend
if [ -d "/opt/luxurywatch-frontend" ]; then
    log "Frontend ya existe, actualizando..."
    cd /opt/luxurywatch-frontend
    npm install
    npm run build
else
    error "Frontend no encontrado en /opt/luxurywatch-frontend"
fi

# Ejecutar migraciones de base de datos
log "Ejecutando migraciones de base de datos..."
cd /opt/luxurywatch-backend
npx prisma migrate deploy

# Reiniciar servicios
log "Reiniciando servicios..."
systemctl restart luxurywatch-backend
systemctl reload nginx

log "Deployment completado!"
log "Verifica que el sitio esté funcionando en tu dominio"
EOF

chmod +x /opt/luxurywatch-deploy.sh

# =============================================================================
# 15. VERIFICACIÓN FINAL
# =============================================================================
log "Verificando instalación..."

# Verificar servicios
if systemctl is-active --quiet postgresql; then
    log "✅ PostgreSQL funcionando"
else
    warn "⚠️  PostgreSQL no está funcionando"
fi

if systemctl is-active --quiet redis-server; then
    log "✅ Redis funcionando"
else
    warn "⚠️  Redis no está funcionando"
fi

if systemctl is-active --quiet nginx; then
    log "✅ Nginx funcionando"
else
    warn "⚠️  Nginx no está funcionando"
fi

# Verificar Node.js
if command -v node > /dev/null; then
    log "✅ Node.js instalado: $(node --version)"
else
    error "❌ Node.js no está instalado"
fi

# Verificar PM2
if command -v pm2 > /dev/null; then
    log "✅ PM2 instalado: $(pm2 --version)"
else
    error "❌ PM2 no está instalado"
fi

# =============================================================================
# INSTRUCCIONES FINALES
# =============================================================================
clear
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  INSTALACIÓN COMPLETADA ✅                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}📋 PRÓXIMOS PASOS:${NC}"
echo ""
echo "1. 📁 Subir archivos del proyecto:"
echo "   - Backend: Copia todos los archivos del backend a /opt/luxurywatch-backend/"
echo "   - Frontend: Copia todos los archivos del frontend a /opt/luxurywatch-frontend/"
echo ""
echo "2. 🔑 Configurar variables de entorno:"
echo "   - Edita /opt/luxurywatch-backend/.env"
echo "   - Añade tus claves API reales"
echo ""
echo "3. 🌐 Configurar dominio:"
echo "   - Reemplaza 'your-domain.com' en /etc/nginx/sites-available/luxurywatch"
echo "   - Configura DNS para apuntar a este servidor"
echo ""
echo "4. 🔒 Configurar SSL:"
echo "   - Certbot: certbot --nginx -d your-domain.com"
echo ""
echo "5. 🚀 Ejecutar deployment:"
echo "   - cd /opt && ./luxurywatch-deploy.sh"
echo ""
echo "6. 🔍 Verificar funcionamiento:"
echo "   - Verifica API: curl https://your-domain.com/api/health"
echo "   - Verifica Web: https://your-domain.com"
echo ""
echo -e "${GREEN}📊 CONFIGURACIÓN ACTUAL:${NC}"
echo "• PostgreSQL: localhost:5432"
echo "• Redis: localhost:6379" 
echo "• Backend API: localhost:3001"
echo "• Nginx: Puerto 80/443"
echo "• Directorios: /opt/luxurywatch-{backend,frontend}/"
echo ""

log "¡Instalación completada exitosamente! 🎉"