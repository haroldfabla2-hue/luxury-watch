#!/bin/bash
# Script de instalación para Atlantic.net
# Ejecutar en el servidor de Atlantic.net

echo "🚀 INSTALACIÓN LUXURYWATCH EN ATLANTIC.NET"
echo "=========================================="

# 1. Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 18
echo "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar PostgreSQL
echo "📦 Instalando PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Instalar Redis
echo "📦 Instalando Redis..."
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 5. Instalar PM2
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# 6. Crear usuario y base de datos
echo "🗄️ Configurando base de datos..."
sudo -u postgres createdb luxurywatch_db
sudo -u postgres psql -c "CREATE USER luxurywatch WITH PASSWORD 'secure_password_123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE luxurywatch_db TO luxurywatch;"

# 7. Configurar firewall
echo "🔥 Configurando firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw --force enable

echo "✅ Instalación básica completada"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Subir código del backend a /var/www/luxurywatch-backend"
echo "2. Configurar .env con DATABASE_URL de PostgreSQL"
echo "3. Ejecutar: npm install && npm run migrate"
echo "4. Subir código del frontend a /var/www/luxurywatch"
echo "5. Configurar Nginx como proxy reverso"
echo "6. Configurar SSL con Let's Encrypt"
echo ""
echo "🌐 URLs finales:"
echo "- Frontend: https://yourdomain.com"
echo "- Backend API: https://yourdomain.com/api"
echo "- Admin: https://yourdomain.com/admin"