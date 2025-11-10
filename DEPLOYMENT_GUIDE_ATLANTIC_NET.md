# LuxuryWatch Platform - Deployment Guide Atlantic.net

## 🚀 DEPLOYMENT COMPLETO A ATLANTIC.NET

### PREREQUISITOS
- Servidor Atlantic.net con Ubuntu 20.04+ / 22.04+
- Acceso SSH como usuario con permisos sudo
- Dominio configurado apuntando al servidor

## 📋 COMANDOS EXACTOS PASO A PASO

### PASO 1: CONECTARSE AL SERVIDOR Y SUBIR ARCHIVOS

```bash
# Desde tu máquina local, conectarte al servidor
ssh usuario@TU-SERVIDOR-ATLANTIC.NET

# Navegar al directorio home
cd ~

# Crear directorio del proyecto
mkdir luxurywatch && cd luxurywatch

# Subir el repositorio completo
git clone [TU-REPOSITORIO-GITHUB] .

# Dar permisos de ejecución a los scripts
chmod +x atlantic-net-install.sh
chmod +x deploy.sh
```

### PASO 2: EJECUTAR INSTALACIÓN COMPLETA DEL SERVIDOR

```bash
# Ejecutar script de instalación (esto instalará Node.js, PostgreSQL, Redis, Nginx, etc.)
./atlantic-net-install.sh
```

**⚠️ IMPORTANTE**: Durante la instalación se pedirá:
- Contraseña para el usuario de la base de datos `luxurywatch`
- Configuración de dominio
- Configuración de SSL (Let's Encrypt)

### PASO 3: CONFIGURAR VARIABLES DE ENTORNO

Crear el archivo `.env` en el directorio principal:

```bash
cd /home/usuario/luxurywatch
nano .env
```

**Contenido del archivo .env:**

```bash
# ===== DATABASE =====
DATABASE_URL="postgresql://luxurywatch:TU_PASSWORD_SEGURA@localhost:5432/luxurywatch_db"

# ===== JWT SECURITY =====
JWT_SECRET="TU_JWT_SECRET_MUY_SEGURA_32_CARACTERES_MINIMO"

# ===== REDIS CACHE =====
REDIS_URL="redis://localhost:6379"

# ===== API CONFIGURATION =====
PORT=3001
NODE_ENV=production

# ===== STRIPE PAYMENTS =====
STRIPE_PUBLISHABLE_KEY="pk_live_tu_clave_publica_stripe"
STRIPE_SECRET_KEY="sk_live_tu_clave_secreta_stripe"
STRIPE_WEBHOOK_SECRET="whsec_tu_webhook_secret"

# ===== FRONTEND API URL =====
VITE_API_URL="https://tu-dominio.com/api"
VITE_WS_URL="wss://tu-dominio.com/ws"

# ===== CORS & SECURITY =====
CORS_ORIGIN="https://tu-dominio.com"

# ===== LOGGING =====
LOG_LEVEL=info

# ===== EMAIL (opcional) =====
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASS="tu-app-password"

# ===== BACKUP =====
BACKUP_SCHEDULE="0 2 * * *"  # 2 AM daily
```

### PASO 4: EJECUTAR MIGRACIONES Y SETUP

```bash
# Instalar dependencias del backend
cd /home/usuario/luxurywatch
npm install

# Ejecutar migraciones de base de datos
cd luxurywatch-backend
npm install
npx prisma migrate deploy
npx prisma generate

# Construir el frontend
cd ../luxurywatch
npm run build

# Configurar permisos
sudo chown -R www-data:www-data /home/usuario/luxurywatch
sudo chmod -R 755 /home/usuario/luxurywatch
```

### PASO 5: CONFIGURAR NGINX Y SSL

```bash
# El script ya instaló Nginx, ahora configurarlo
sudo nano /etc/nginx/sites-available/luxurywatch
```

**Configuración de Nginx:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket for AI Chat
    location /ws/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend (React)
    location / {
        root /home/usuario/luxurywatch/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Activar la configuración:**

```bash
# Activar el sitio
sudo ln -s /etc/nginx/sites-available/luxurywatch /etc/nginx/sites-enabled/

# Eliminar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### PASO 6: CONFIGURAR SSL CON LET'S ENCRYPT

```bash
# Instalar Certbot si no está instalado
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar esta línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

### PASO 7: INICIAR SERVICIOS

```bash
# Iniciar el backend con PM2
cd /home/usuario/luxurywatch
pm2 start luxurywatch-backend/server.js --name "luxurywatch-backend"
pm2 save
pm2 startup

# Iniciar el frontend (servir archivos estáticos)
pm2 start "npm run preview" --name "luxurywatch-frontend"

# Verificar que todo esté corriendo
pm2 list
pm2 logs
```

### PASO 8: VERIFICACIÓN FINAL

```bash
# Verificar servicios
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis

# Verificar conectividad
curl -I https://tu-dominio.com
curl -I https://tu-dominio.com/api/health

# Ver logs
pm2 logs luxurywatch-backend
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🛠️ COMANDOS DE MANTENIMIENTO

```bash
# Actualizar la aplicación
./deploy.sh

# Ver logs en tiempo real
pm2 logs

# Reiniciar servicios
pm2 restart luxurywatch-backend
pm2 restart luxurywatch-frontend

# Backup de la base de datos
pg_dump -U luxurywatch luxurywatch_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Monitoreo de recursos
htop
df -h
free -h
```

## 📊 VERIFICACIÓN DE FUNCIONAMIENTO

1. **Frontend**: https://tu-dominio.com
2. **API**: https://tu-dominio.com/api/health
3. **WebSocket**: wss://tu-dominio.com/ws/chat
4. **Base de datos**: Verificar conexión con `psql`

## 🚨 TROUBLESHOOTING

Si algo no funciona:

```bash
# Revisar logs de errores
sudo tail -f /var/log/nginx/error.log
pm2 logs --lines 50

# Verificar servicios
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis

# Verificar puertos
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :3001
```

## ✅ CHECKLIST DE DEPLOYMENT

- [ ] Servidor accesible por SSH
- [ ] Dominio configurado y apuntando al servidor
- [ ] Repositorio clonado correctamente
- [ ] Script de instalación ejecutado sin errores
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada y poblada
- [ ] Frontend construido exitosamente
- [ ] Nginx configurado y SSL activo
- [ ] PM2 servicios corriendo
- [ ] Certificados SSL válidos
- [ ] WebSocket funcionando
- [ ] API respondiendo correctamente
- [ ] Frontend cargando sin errores

---

**¡Tu aplicación LuxuryWatch estará 100% operativa en producción!** 🎉