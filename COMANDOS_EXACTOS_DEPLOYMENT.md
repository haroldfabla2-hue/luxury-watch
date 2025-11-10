# 🎯 COMANDOS EXACTOS PARA DEPLOYMENT EN ATLANTIC.NET

## ✅ PREPARACIÓN COMPLETADA
- ✅ Repositorio Git inicializado y subido
- ✅ Scripts de deployment creados
- ✅ Documentación completa generada
- ✅ Sistema 100% listo para producción

---

## 🚀 EJECUTA ESTOS COMANDOS EN ORDEN

### **PASO 1: Conectar al servidor y subir archivos**

```bash
# 1. Conectarte a tu servidor Atlantic.net
ssh usuario@TU-IP-SERVIDOR-ATLANTIC

# 2. Navegar al directorio home
cd ~

# 3. Crear directorio del proyecto
mkdir luxurywatch && cd luxurywatch

# 4. Clonar el repositorio (REEMPLAZA CON TU REPO)
git clone [TU-URL-DEL-REPOSITORIO] .

# 5. Dar permisos de ejecución
chmod +x atlantic-net-install.sh
chmod +x deploy.sh
chmod +x luxurywatch/deploy.sh
```

### **PASO 2: Ejecutar instalación completa del servidor**

```bash
# ⚠️ ESTE COMANDO INSTALARÁ TODO: Node.js, PostgreSQL, Redis, Nginx, SSL
./atlantic-net-install.sh
```

**Durante la instalación se te pedirá:**
- Contraseña para la base de datos (anótala)
- Confirmar configuración de dominio
- Configurar SSL

### **PASO 3: Configurar variables de entorno**

```bash
# Crear archivo de configuración
nano .env
```

**Copiar y pegar este contenido (REEMPLAZA LOS VALORES):**

```bash
# ===== DATABASE =====
DATABASE_URL="postgresql://luxurywatch:TU_PASSWORD_AQUI@localhost:5432/luxurywatch_db"

# ===== JWT SECURITY =====
JWT_SECRET="TU_JWT_SECRET_32_CARACTERES_MINIMO_AQUI"

# ===== REDIS CACHE =====
REDIS_URL="redis://localhost:6379"

# ===== API =====
PORT=3001
NODE_ENV=production

# ===== STRIPE =====
STRIPE_PUBLISHABLE_KEY="pk_live_tu_clave_publica"
STRIPE_SECRET_KEY="sk_live_tu_clave_secreta"

# ===== DOMINIO =====
VITE_API_URL="https://tu-dominio.com/api"
VITE_WS_URL="wss://tu-dominio.com/ws"
CORS_ORIGIN="https://tu-dominio.com"
```

**Guardar y salir:** `Ctrl+X` + `Y` + `Enter`

### **PASO 4: Ejecutar migraciones y setup**

```bash
# Instalar dependencias
npm install

# Backend
cd luxurywatch-backend && npm install
npx prisma migrate deploy
npx prisma generate
cd ..

# Frontend
npm run build

# Permisos
sudo chown -R www-data:www-data /home/usuario/luxurywatch
```

### **PASO 5: Configurar Nginx y SSL**

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/luxurywatch
```

**Copiar esta configuración (REEMPLAZA tu-dominio.com):**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    location / {
        root /home/usuario/luxurywatch/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

**Activar la configuración:**

```bash
sudo ln -s /etc/nginx/sites-available/luxurywatch /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### **PASO 6: SSL con Let's Encrypt**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado (REEMPLAZA tu-dominio.com)
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### **PASO 7: Iniciar servicios**

```bash
# Iniciar backend
pm2 start luxurywatch-backend/server.js --name "luxurywatch-backend"
pm2 save
pm2 startup

# Verificar que todo esté corriendo
pm2 list
```

### **PASO 8: Verificación final**

```bash
# Probar la API
curl -I https://tu-dominio.com/api/health

# Probar el frontend
curl -I https://tu-dominio.com

# Ver logs
pm2 logs
```

---

## 🎉 ¡COMPLETADO!

**Tu aplicación estará disponible en:**
- 🌐 **Frontend**: https://tu-dominio.com
- 🔌 **API**: https://tu-dominio.com/api
- 💬 **WebSocket**: wss://tu-dominio.com/ws/chat

---

## 🔧 COMANDOS DE MANTENIMIENTO

```bash
# Actualizar aplicación
./deploy.sh

# Ver logs
pm2 logs luxurywatch-backend

# Reiniciar servicios
pm2 restart luxurywatch-backend
```

---

**⚠️ IMPORTANTE**: 
1. Reemplaza `tu-dominio.com` con tu dominio real
2. Reemplaza las variables con tus valores reales (Stripe, JWT, etc.)
3. Mantén las contraseñas seguras y anótalas
4. Si algo falla, revisa los logs con `pm2 logs`