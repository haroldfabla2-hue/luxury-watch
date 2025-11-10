#!/bin/bash
# Script de configuración rápida para migración de frontend
# Ejecutar en /workspace/luxurywatch

echo "🚀 CONFIGURACIÓN RÁPIDA FRONTEND → BACKEND"
echo "=========================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json. Ejecutar desde /workspace/luxurywatch"
    exit 1
fi

# 1. Configurar variables de entorno
echo "📝 Configurando variables de entorno..."

# Crear .env.local si no existe
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo "✅ Archivo .env.local creado desde template"
else
    echo "✅ Archivo .env.local ya existe"
fi

# Actualizar .env.local con URLs del backend
sed -i 's|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://localhost:3001|' .env.local
sed -i 's|VITE_WS_URL=.*|VITE_WS_URL=ws://localhost:3001|' .env.local
echo "✅ URLs del backend configuradas"

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --silent
if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# 3. Verificar que los archivos clave existen
echo "🔍 Verificando archivos migrados..."

REQUIRED_FILES=(
    "src/lib/api.js"
    "src/contexts/AuthContext.tsx"
    "src/store/configuratorStore.ts"
    "src/components/CRMDashboard.tsx"
    "src/lib/config.js"
)

all_files_exist=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (FALTANTE)"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    echo "✅ Todos los archivos migrados están presentes"
else
    echo "❌ Faltan algunos archivos. Verificar migración."
    exit 1
fi

# 4. Probar conectividad con backend
echo "🌐 Probando conectividad con backend..."
curl -s http://localhost:3001/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend respondiendo en puerto 3001"
else
    echo "⚠️  Backend no está ejecutándose en puerto 3001"
    echo "   Ejecutar: cd /workspace/luxurywatch-backend && npm start"
fi

# 5. Construir frontend
echo "🏗️ Construyendo frontend..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend construido exitosamente"
else
    echo "❌ Error construyendo frontend"
    exit 1
fi

# 6. Mostrar resumen
echo ""
echo "🎉 ¡CONFIGURACIÓN COMPLETADA!"
echo "============================="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Verificar backend: cd /workspace/luxurywatch-backend && npm start"
echo "2. Iniciar frontend: npm run dev"
echo "3. Abrir navegador: http://localhost:5173"
echo ""
echo "🔗 URLS IMPORTANTES:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:3001/api"
echo "- CRM Dashboard: http://localhost:5173/crm"
echo ""
echo "🧪 TESTING:"
echo "- Probar login: http://localhost:5173"
echo "- Probar CRM: http://localhost:5173/crm"
echo "- Probar API: curl http://localhost:3001/api/health"
echo ""
echo "⚠️  COMPONENTES PENDIENTES:"
echo "- AIChat (WebSocket)"
echo "- APIManagement (Proveedores IA)"
echo "- Configurador 3D (Integración API)"
echo "- Sistema de pagos (Stripe)"
echo ""

# 7. Ofrecer iniciar servicios
echo ""
read -p "¿Quieres iniciar el frontend ahora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Iniciando frontend..."
    npm run dev
fi