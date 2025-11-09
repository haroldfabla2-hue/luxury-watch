# Configuración de Entorno de Desarrollo - Atlantic.net
## Sistema de Personalización 3D de Relojes

### Especificaciones del Servidor
- **Proveedor**: Atlantic.net
- **vCPUs**: 4
- **RAM**: 8GB
- **OS**: Ubuntu 20.04/22.04 LTS (Recomendado)

---

## 📋 Prerrequisitos

### 1. Acceso SSH
```bash
# Conexión inicial al servidor
ssh root@tu-servidor-ip
# o
ssh usuario@tu-servidor-ip
```

### 2. Actualización del Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
sudo apt autoclean
```

---

## 🐳 1. Instalación de Docker

### Paso 1: Actualizar repositorios
```bash
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
```

### Paso 2: Añadir clave GPG oficial de Docker
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### Paso 3: Añadir repositorio estable de Docker
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Paso 4: Instalar Docker Engine
```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Paso 5: Configurar usuario para Docker
```bash
# Añadir usuario al grupo docker
sudo usermod -aG docker $USER

# Verificar instalación
docker --version
docker compose version
```

### Paso 6: Iniciar y habilitar Docker
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 🔧 2. Instalación de Node.js 18+

### Método 1: Usando NodeSource (Recomendado)
```bash
# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### Método 2: Usando NVM (Gestión de versiones)
```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar terminal o ejecutar:
source ~/.bashrc

# Instalar Node.js 18+
nvm install 18
nvm use 18
nvm alias default 18
```

### Configuración adicional de Node.js
```bash
# Instalar paquetes globales útiles
npm install -g yarn pnpm pm2 nodemon eslint prettier

# Verificar instalación
node --version
npm --version
yarn --version
```

---

## 🐍 3. Instalación de Python 3.9+

### Paso 1: Instalar Python y pip
```bash
sudo apt update
sudo apt install -y python3.9 python3.9-venv python3.9-dev python3-pip
```

### Paso 2: Configurar Python como predeterminado
```bash
# Crear enlaces simbólicos
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1

# Verificar instalación
python3 --version
python --version
pip3 --version
```

### Paso 3: Instalar dependencias adicionales
```bash
# Bibliotecas para desarrollo
sudo apt install -y python3.9-venv python3.9-distutils

# Instalar pip para Python 3.9
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3.9 get-pip.py

# Bibliotecas útiles
pip3 install --upgrade pip setuptools wheel
pip3 install virtualenv poetry
```

---

## 🛠️ 4. Instalación de Herramientas de Sistema

### Herramientas básicas
```bash
sudo apt update
sudo apt install -y \
    git \
    curl \
    wget \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip \
    zip \
    tar \
    htop \
    nano \
    vim \
    tree \
    jq \
    net-tools \
    ufw \
    fail2ban
```

### Herramientas de desarrollo específicas
```bash
# Para proyectos web y 3D
sudo apt install -y \
    nginx \
    redis-server \
    postgresql-client \
    postgresql-contrib \
    sqlite3 \
    imagemagick \
    ffmpeg \
    graphicsmagick

# Para proyectos de machine learning
sudo apt install -y \
    libatlas-base-dev \
    gfortran \
    libblas-dev \
    liblapack-dev \
    libhdf5-dev \
    pkg-config
```

---

## 🔐 5. Configuración de Variables de Entorno

### Archivo de configuración global
```bash
sudo nano /etc/environment
```

### Agregar las siguientes variables:
```bash
# Variables de entorno para Sistema de Relojes 3D
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096
PYTHONPATH=/usr/local/lib/python3.9/site-packages
TZ=UTC

# Variables para Docker
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1

# Variables para desarrollo
DEV_PORT=3000
API_PORT=8000
DB_PORT=5432
REDIS_PORT=6379

# Variables para archivos y uploads
UPLOAD_MAX_SIZE=100M
MAX_FILE_SIZE=50M

# Variables para rendimiento
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1024
```

### Variables de entorno de usuario
```bash
nano ~/.bashrc
```

### Agregar al final del archivo:
```bash
# Personalización de entorno
export PATH="$PATH:/usr/local/bin:/usr/bin:/bin"
export NODE_ENV=development
export PYTHONPATH="${PYTHONPATH}:~/workspace"

# Aliases útiles
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias gs='git status'
alias gd='git diff'
alias gc='git commit -m'
alias docker-clean='docker system prune -af'
alias docker-logs='docker logs -f'

# Funciones útiles
mkcd() { mkdir -p "$1" && cd "$1"; }
extract() { if [ -f $1 ]; then case $1 in *.tar.bz2) tar xjf $1;; *.tar.gz) tar xzf $1;; *.bz2) bunzip2 $1;; *.rar) unrar e $1;; *.zip) unzip $1;; *) echo "No se puede extraer $1"; esac; else echo "No es un archivo válido"; fi; }
```

### Aplicar cambios
```bash
source ~/.bashrc
```

---

## 🚀 6. Instalación de CUDA Toolkit (Si GPU disponible)

### Paso 1: Verificar hardware
```bash
# Verificar si hay GPU NVIDIA
lspci | grep -i nvidia

# Si hay GPU, verificar driver
nvidia-smi
```

### Paso 2: Instalar driver NVIDIA (si no está instalado)
```bash
# Instalar driver recomendado
sudo ubuntu-drivers autoinstall

# O instalar versión específica
sudo apt install nvidia-driver-470
```

### Paso 3: Instalar CUDA Toolkit
```bash
# Descargar e instalar CUDA 11.8
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt-get update
sudo apt-get install -y cuda-toolkit-11-8

# Configurar PATH
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### Paso 4: Verificar instalación
```bash
nvcc --version
nvidia-smi
```

---

## 🔒 7. Configuración de Puertos y Firewall

### Configuración de UFW (Firewall)
```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH (puerto 22)
sudo ufw allow 22/tcp

# Permitir HTTP (puerto 80)
sudo ufw allow 80/tcp

# Permitir HTTPS (puerto 443)
sudo ufw allow 443/tcp

# Puertos para aplicación Node.js (3000)
sudo ufw allow 3000/tcp

# Puertos para API (8000)
sudo ufw allow 8000/tcp

# Puertos para base de datos (5432)
sudo ufw allow 5432/tcp

# Puertos para Redis (6379)
sudo ufw allow 6379/tcp

# Mostrar estado
sudo ufw status verbose
```

### Configuración de fail2ban
```bash
# Configurar fail2ban para SSH
sudo nano /etc/fail2ban/jail.local
```

### Configuración de fail2ban:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
```

### Reiniciar servicios
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo systemctl restart ufw
```

---

## 📦 8. Estructura de Directorios del Proyecto

### Crear estructura de directorios
```bash
mkdir -p ~/workspace/3d-watch-system
cd ~/workspace/3d-watch-system

# Crear estructura de directorios
mkdir -p {backend,frontend,database,docs,scripts,config,logs,storage/{uploads,exports}}

# Permisos correctos
chmod -R 755 ~/workspace/3d-watch-system
```

### Directorio de configuración de Docker
```bash
mkdir -p ~/workspace/3d-watch-system/docker
```

---

## 🐳 9. Configuración de Docker Compose

### Crear docker-compose.yml
```yaml
version: '3.8'

services:
  # Aplicación Principal (Node.js)
  app:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./storage/uploads:/app/uploads
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  # API Python para ML/IA
  ml-api:
    build:
      context: ./ml-service
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PYTHONPATH=/app
      - DB_HOST=postgres
    volumes:
      - ./ml-service:/app
      - ./storage:/app/storage
    depends_on:
      - postgres
    restart: unless-stopped

  # Base de Datos PostgreSQL
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: watch_3d_db
      POSTGRES_USER: watch_user
      POSTGRES_PASSWORD: secure_password_change_me
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Cache Redis
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  # Nginx como proxy reverso
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./config/nginx/ssl:/etc/nginx/ssl
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - app
      - ml-api
    restart: unless-stopped

  # Monitoreo
  monitoring:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: watch_3d_network
```

---

## 📜 10. Script de Instalación Automatizada

### Crear script de instalación completa
```bash
nano ~/workspace/install_complete.sh
```

### Contenido del script:
```bash
#!/bin/bash

# Script de instalación completa para Atlantic.net
# Sistema de Personalización 3D de Relojes

set -e  # Salir si cualquier comando falla

echo "🚀 Iniciando instalación del entorno de desarrollo..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sin color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que se ejecuta como root o con sudo
if [[ $EUID -eq 0 ]]; then
   error "Este script no debe ejecutarse como root. Ejecutar como usuario normal con sudo."
fi

# Actualizar sistema
log "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y

# Instalar herramientas básicas
log "Instalando herramientas básicas..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    build-essential \
    git \
    wget \
    unzip \
    zip \
    tar \
    htop \
    nano \
    vim \
    tree \
    jq \
    net-tools \
    ufw \
    fail2ban

# Instalar Docker
log "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
    sudo systemctl start docker
    sudo systemctl enable docker
    log "Docker instalado correctamente"
else
    warning "Docker ya está instalado"
fi

# Instalar Node.js 18+
log "Instalando Node.js 18+..."
if ! command -v node &> /dev/null || ! node --version | grep -q "v18"; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log "Node.js instalado: $(node --version)"
else
    warning "Node.js 18+ ya está instalado"
fi

# Instalar herramientas globales de Node.js
log "Instalando herramientas globales de Node.js..."
npm install -g yarn pnpm pm2 nodemon eslint prettier

# Instalar Python 3.9+
log "Instalando Python 3.9+..."
if ! python3 --version | grep -q "Python 3.9"; then
    sudo apt install -y python3.9 python3.9-venv python3.9-dev python3-pip
    sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1
    sudo update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3.9 get-pip.py
    log "Python instalado: $(python3 --version)"
else
    warning "Python 3.9+ ya está instalado"
fi

# Configurar variables de entorno
log "Configurando variables de entorno..."
sudo tee /etc/environment > /dev/null <<EOF
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096
PYTHONPATH=/usr/local/lib/python3.9/site-packages
TZ=UTC
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1
DEV_PORT=3000
API_PORT=8000
DB_PORT=5432
REDIS_PORT=6379
UPLOAD_MAX_SIZE=100M
MAX_FILE_SIZE=50M
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1024
EOF

# Configurar usuario
tee -a ~/.bashrc > /dev/null <<EOF
# Variables de entorno
export PATH="\$PATH:/usr/local/bin:/usr/bin:/bin"
export NODE_ENV=development
export PYTHONPATH="\${PYTHONPATH}:~/workspace"

# Aliases
alias ll='ls -la'
alias la='ls -A'
alias gs='git status'
alias docker-clean='docker system prune -af'
alias docker-logs='docker logs -f'
mkcd() { mkdir -p "\$1" && cd "\$1"; }
extract() { if [ -f \$1 ]; then case \$1 in *.tar.bz2) tar xjf \$1;; *.tar.gz) tar xzf \$1;; *.bz2) bunzip2 \$1;; *.rar) unrar e \$1;; *.zip) unzip \$1;; *) echo "No se puede extraer \$1"; esac; else echo "No es un archivo válido"; fi; }
EOF

# Configurar firewall
log "Configurando firewall..."
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 5432/tcp
sudo ufw allow 6379/tcp

# Configurar fail2ban
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Crear estructura de directorios
log "Creando estructura de directorios..."
mkdir -p ~/workspace/3d-watch-system/{backend,frontend,database,docs,scripts,config,logs,storage/{uploads,exports},docker}
chmod -R 755 ~/workspace/3d-watch-system

# Verificar GPU para CUDA
log "Verificando hardware GPU..."
if lspci | grep -i nvidia > /dev/null; then
    warning "GPU NVIDIA detectada. Instalar CUDA manualmente si es necesario."
    warning "Ejecutar: wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-keyring_1.0-1_all.deb"
else
    log "No se detectó GPU NVIDIA. Continuando sin CUDA."
fi

# Reiniciar servicios
log "Reiniciando servicios..."
sudo systemctl restart docker
sudo systemctl restart fail2ban
sudo systemctl restart ufw

# Verificar instalación
log "Verificando instalación..."
command -v docker >/dev/null 2>&1 && echo "✓ Docker: $(docker --version)"
command -v node >/dev/null 2>&1 && echo "✓ Node.js: $(node --version)"
command -v python3 >/dev/null 2>&1 && echo "✓ Python: $(python3 --version)"
command -v git >/dev/null 2>&1 && echo "✓ Git: $(git --version)"

log "🎉 Instalación completada!"
log "📋 Próximos pasos:"
echo "  1. Reiniciar la sesión: source ~/.bashrc"
echo "  2. Crear archivos de configuración del proyecto"
echo "  3. Configurar certificados SSL si es necesario"
echo "  4. Instalar dependencias del proyecto específico"
echo ""
warning "IMPORTANTE: Reinicia tu sesión para que los cambios de grupos tengan efecto"
```

### Hacer ejecutable el script
```bash
chmod +x ~/workspace/install_complete.sh
```

### Ejecutar instalación automatizada
```bash
cd ~/workspace
./install_complete.sh
```

---

## ✅ 11. Verificación del Entorno

### Script de verificación
```bash
nano ~/workspace/verify_setup.sh
```

### Contenido del script de verificación:
```bash
#!/bin/bash

echo "🔍 Verificando configuración del entorno..."
echo ""

# Verificar sistema
echo "Sistema:"
lsb_release -a 2>/dev/null || cat /etc/os-release
echo ""

# Verificar recursos
echo "Recursos del sistema:"
echo "CPU: $(nproc) cores"
echo "RAM: $(free -h | grep '^Mem:' | awk '{print $2}')"
echo "Disco: $(df -h / | tail -1 | awk '{print $2}')"
echo ""

# Verificar software instalado
echo "Software instalado:"
command -v docker && echo "Docker: $(docker --version)"
command -v docker-compose && echo "Docker Compose: $(docker-compose --version)"
command -v node && echo "Node.js: $(node --version)"
command -v npm && echo "NPM: $(npm --version)"
command -v yarn && echo "Yarn: $(yarn --version)"
command -v python3 && echo "Python3: $(python3 --version)"
command -v pip3 && echo "Pip3: $(pip3 --version)"
command -v git && echo "Git: $(git --version)"
echo ""

# Verificar servicios
echo "Servicios:"
systemctl is-active --quiet docker && echo "Docker: Activo" || echo "Docker: Inactivo"
systemctl is-active --quiet ufw && echo "UFW: Activo" || echo "UFW: Inactivo"
systemctl is-active --quiet fail2ban && echo "Fail2ban: Activo" || echo "Fail2ban: Inactivo"
echo ""

# Verificar puertos
echo "Puertos abiertos:"
sudo ufw status | grep -E "Status|ALLOW"
echo ""

# Verificar variables de entorno
echo "Variables de entorno clave:"
echo "NODE_ENV: ${NODE_ENV:-'No configurado'}"
echo "PYTHONPATH: ${PYTHONPATH:-'No configurado'}"
echo "PATH contains Node: $(echo $PATH | grep -o node | head -1 || echo 'No')"
echo ""

# Verificar GPU
echo "GPU:"
if command -v nvidia-smi &> /dev/null; then
    echo "NVIDIA GPU detectada:"
    nvidia-smi
else
    echo "No se detectó GPU NVIDIA"
fi

echo ""
echo "✅ Verificación completada"
```

### Ejecutar verificación
```bash
chmod +x ~/workspace/verify_setup.sh
./verify_setup.sh
```

---

## 🛠️ 12. Configuración Post-Instalación

### 1. Reiniciar sesión
```bash
# O simplemente recargar bash
source ~/.bashrc
```

### 2. Configurar Git (si es necesario)
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --global init.defaultBranch main
```

### 3. Crear certificados SSL básicos (opcional)
```bash
# Para desarrollo local
mkdir -p ~/workspace/3d-watch-system/config/nginx/ssl
cd ~/workspace/3d-watch-system/config/nginx/ssl

# Generar certificado autofirmado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout server.key -out server.crt \
    -subj "/C=ES/ST=Madrid/L=Madrid/O=3D Watch/OU=IT/CN=localhost"
```

### 4. Configurar PM2 para Node.js (producción)
```bash
# Instalar PM2 globalmente (ya instalado)
# Crear archivo de configuración
nano ~/workspace/3d-watch-system/ecosystem.config.js
```

### Contenido para ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: '3d-watch-app',
    script: './backend/src/app.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
}
```

---

## 📊 13. Monitoreo y Mantenimiento

### Logs del sistema
```bash
# Ver logs de Docker
docker logs -f container_name

# Ver logs de servicios
journalctl -u docker -f
journalctl -u fail2ban -f

# Verificar uso de recursos
htop
df -h
free -h
```

### Scripts de mantenimiento
```bash
nano ~/workspace/scripts/maintenance.sh
```

### Contenido del script de mantenimiento:
```bash
#!/bin/bash

echo "🧹 Iniciando mantenimiento del sistema..."

# Limpiar Docker
echo "Limpiando Docker..."
docker system prune -af
docker volume prune -f

# Limpiar logs del sistema
echo "Limpiando logs antiguos..."
sudo journalctl --vacuum-time=7d

# Actualizar paquetes de seguridad
echo "Actualizando paquetes de seguridad..."
sudo apt update && sudo apt list --upgradable

# Verificar servicios críticos
echo "Verificando servicios..."
systemctl is-active docker ufw fail2ban nginx

# Verificar uso de disco
echo "Uso de disco:"
df -h / | tail -1

echo "✅ Mantenimiento completado"
```

### Hacer ejecutable y programar en cron
```bash
chmod +x ~/workspace/scripts/maintenance.sh

# Agregar a crontab (semanal)
crontab -e
# Añadir: 0 2 * * 0 /home/user/workspace/scripts/maintenance.sh
```

---

## 🚨 14. Solución de Problemas Comunes

### Docker no funciona después de la instalación
```bash
# Verificar que el usuario esté en el grupo docker
groups $USER

# Si no está, añadirlo
sudo usermod -aG docker $USER

# Cerrar sesión y volver a iniciar
# O usar newgrp
newgrp docker
```

### Node.js no se instala correctamente
```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Puertos bloqueados
```bash
# Verificar estado del firewall
sudo ufw status verbose

# Permitir puerto específico
sudo ufw allow puerto/tcp

# Verificar si el puerto está en uso
sudo netstat -tulpn | grep puerto
```

### Problemas de memoria con Node.js
```bash
# Verificar uso de memoria
free -h
top

# Aumentar límite de memoria para Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
```

---

## 📚 15. Referencias y Recursos Adicionales

### Documentación oficial
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Python Documentation](https://docs.python.org/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)

### Herramientas recomendadas
- **Monitoreo**: Grafana, Prometheus
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Testing**: Jest, Mocha, Pytest
- **Deployment**: PM2, Nginx, Let's Encrypt

### Puertos típicos para el proyecto
- **80/443**: HTTP/HTTPS (Nginx)
- **3000**: Aplicación Node.js principal
- **8000**: API Python/ML
- **5432**: PostgreSQL
- **6379**: Redis
- **9090**: Prometheus (monitoring)

---

## 🎯 Resumen de Comandos Rápidos

```bash
# Verificar todo el entorno
~/workspace/verify_setup.sh

# Reiniciar todos los servicios
sudo systemctl restart docker ufw fail2ban

# Ver logs en tiempo real
docker logs -f app
journalctl -f

# Limpiar sistema
~/workspace/scripts/maintenance.sh

# Conectar a la base de datos
psql -h localhost -U watch_user -d watch_3d_db

# Ver estado de contenedores
docker-compose ps

# Recargar configuración de nginx
sudo nginx -s reload
```

---

**✅ Configuración completada exitosamente**

Este entorno está optimizado para el desarrollo de un sistema de personalización 3D de relojes en Atlantic.net con las siguientes ventajas:

- ✅ **Docker** para containerización
- ✅ **Node.js 18+** para backend y frontend
- ✅ **Python 3.9+** para ML/IA
- ✅ **PostgreSQL + Redis** para base de datos y cache
- ✅ **Nginx** como proxy reverso
- ✅ **Firewall** y seguridad configurados
- ✅ **Monitoreo** básico incluido
- ✅ **Scripts** de automatización

El servidor está listo para el desarrollo y despliegue de la aplicación 3D de relojes.
