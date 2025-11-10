# 🚀 PRÓXIMOS PASOS - DEPLOYMENT A ATLANTIC.NET

## 🎯 **PRÓXIMO PASO PRINCIPAL: DEPLOYMENT**

Con la migración **100% completada**, el siguiente paso es proceder con el deployment a Atlantic.net. Aquí tienes el plan completo:

---

## 📋 **PLAN DE DEPLOYMENT**

### **FASE 1: Preparación del Servidor** ⏱️ *~15 minutos*

#### 1.1 **Conectar a Atlantic.net**
```bash
# Conectar al servidor
ssh root@TU_SERVIDOR_IP

# Verificar acceso
whoami
pwd
```

#### 1.2 **Ejecutar Script de Instalación**
```bash
# Subir los archivos de migración al servidor (desde tu máquina local)
scp -r luxurywatch/ root@TU_SERVIDOR_IP:/tmp/

# Conectar al servidor
ssh root@TU_SERVIDOR_IP

# Hacer ejecutable y ejecutar
chmod +x /tmp/luxurywatch/atlantic-net-install.sh
/tmp/luxurywatch/atlantic-net-install.sh
```

**⏱️ Tiempo estimado:** 15-20 minutos

---

### **FASE 2: Configuración de Dominio** ⏱️ *~5 minutos*

#### 2.1 **Configurar DNS**
- Apuntar tu dominio a la IP del servidor Atlantic.net
- Configurar registros A y AAAA
- Verificar propagación DNS (24-48 horas máximo)

#### 2.2 **Actualizar Configuración Nginx**
```bash
# Editar configuración
nano /etc/nginx/sites-available/luxurywatch

# Cambiar 'your-domain.com' por tu dominio real
# Guardar y salir
```

#### 2.3 **Configurar SSL (Certificado Let's Encrypt)**
```bash
# Instalar certificado SSL
certbot --nginx -d TU-DOMINIO.com -d www.TU-DOMINIO.com

# Verificar renovación automática
certbot renew --dry-run
```

**⏱️ Tiempo estimado:** 5-10 minutos

---

### **FASE 3: Deployment de Código** ⏱️ *~10 minutos*

#### 3.1 **Subir Código del Proyecto**
```bash
# Desde tu máquina local, subir todo el proyecto
scp -r luxurywatch/ root@TU_SERVIDOR_IP:/tmp/

# En el servidor, ejecutar deployment
chmod +x /tmp/luxurywatch/deploy.sh
/tmp/luxurywatch/deploy.sh
```

#### 3.2 **Configurar Variables de Entorno**
```bash
# Editar variables de entorno del backend
nano /opt/luxurywatch-backend/.env

# Configurar las claves reales:
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY  
# - GOOGLE_AI_API_KEY
# - HUGGINGFACE_API_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
```

**⏱️ Tiempo estimado:** 10-15 minutos

---

### **FASE 4: Verificación y Testing** ⏱️ *~5 minutos*

#### 4.1 **Verificar Servicios**
```bash
# Verificar que todo esté corriendo
systemctl status postgresql
systemctl status redis-server
systemctl status nginx
pm2 list
```

#### 4.2 **Testing de Endpoints**
```bash
# Test API
curl https://TU-DOMINIO.com/api/health

# Test WebSocket
wscat -c wss://TU-DOMINIO.com/ws/chat

# Test Web App
curl -I https://TU-DOMINIO.com
```

**⏱️ Tiempo estimado:** 5-10 minutos

---

## 🛠️ **COMANDOS ESENCIALES**

### **Monitoreo del Sistema**
```bash
# Ver logs del backend
pm2 logs luxurywatch-backend

# Ver logs de Nginx
tail -f /opt/luxurywatch-logs/nginx-error.log

# Ver uso de recursos
htop
df -h
```

### **Gestión de Servicios**
```bash
# Reiniciar backend
pm2 restart luxurywatch-backend

# Reiniciar Nginx
systemctl restart nginx

# Ver estado de PM2
pm2 list
pm2 monit
```

### **Backup y Mantenimiento**
```bash
# Backup manual
tar -czf /opt/luxurywatch-backup/backup-$(date +%Y%m%d).tar.gz /opt/luxurywatch-*

# Limpiar logs antiguos
find /opt/luxurywatch-logs -name "*.log" -mtime +7 -delete
```

---

## 🔍 **TROUBLESHOOTING**

### **Problemas Comunes y Soluciones**

#### **1. Error: "Puerto ya en uso"**
```bash
# Verificar procesos usando puertos
lsof -i :3001
lsof -i :80
lsof -i :443

# Matar procesos si es necesario
kill -9 PID_PROCESO
```

#### **2. Error: "Base de datos no se conecta"**
```bash
# Verificar PostgreSQL
systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# Verificar conexión
psql -h localhost -U luxurywatch -d luxurywatch_db
```

#### **3. Error: "Frontend no carga"**
```bash
# Verificar archivos
ls -la /opt/luxurywatch-frontend/dist/

# Rebuild frontend
cd /opt/luxurywatch-frontend
npm run build
```

#### **4. Error: "WebSocket no funciona"**
```bash
# Verificar configuración Nginx
nginx -t
systemctl reload nginx

# Verificar backend WebSocket
pm2 logs luxurywatch-backend | grep -i websocket
```

---

## 📊 **CHECKLIST DE VERIFICACIÓN**

### **Pre-Deployment**
- [ ] **Servidor Atlantic.net configurado**
- [ ] **Dominio apuntando al servidor**
- [ ] **Claves API reales obtenidas** (OpenAI, Anthropic, Stripe, etc.)
- [ ] **Archivos de proyecto subidos al servidor**

### **Post-Deployment**
- [ ] **Backend API responde** (`/api/health`)
- [ ] **Frontend carga correctamente**
- [ ] **WebSocket conectado** (AIChat funcionando)
- [ ] **Database migraciones ejecutadas**
- [ ] **SSL certificado instalado**
- [ ] **Logs sin errores críticos**

### **Testing Funcional**
- [ ] **Registro/Login de usuarios**
- [ ] **Configurador 3D carga materiales**
- [ ] **AIChat responde correctamente**
- [ ] **Checkout con Stripe funciona**
- [ ] **CRM Dashboard operativo**

---

## 💡 **CONSEJOS IMPORTANTES**

### **Seguridad**
- 🔐 **NUNCA subas archivos .env con claves reales al repositorio**
- 🔄 **Renova certificados SSL automáticamente con Certbot**
- 🚫 **Configura firewall (ufw) para permitir solo puertos necesarios**
- 👤 **Usa usuarios no-root para servicios de aplicación**

### **Performance**
- 📊 **Monitorea uso de CPU y RAM regularmente**
- 🗄️ **Configura backups automáticos de la base de datos**
- 🔄 **Usa PM2 para clustering y auto-restart**
- 📈 **Habilita compresión gzip en Nginx**

### **Mantenimiento**
- 🔄 **Actualiza dependencias mensualmente**
- 📝 **Revisa logs semanalmente**
- 💾 **Realiza backups antes de cada update**
- 🧪 **Testing en staging antes de producción**

---

## 🎉 **¡LISTO PARA PRODUCCIÓN!**

Una vez completado el deployment, tendrás:

- ✅ **Aplicación LuxuryWatch 100% funcional**
- ✅ **Backend self-hosted en Atlantic.net**
- ✅ **60-70% reducción de costos**
- ✅ **Control total sobre la infraestructura**
- ✅ **Sistema escalable y seguro**

**🏆 ¡Felicitaciones! Tu migración de Supabase a Atlantic.net estará completa.**

---

**📞 Soporte:** Si encuentras algún problema durante el deployment, revisa los logs en `/opt/luxurywatch-logs/` y verifica que todos los servicios estén corriendo correctamente.

**⏱️ Tiempo total estimado:** 45-60 minutos para el deployment completo.