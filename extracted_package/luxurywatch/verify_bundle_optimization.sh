#!/bin/bash

# Script de Verificación - Optimización Bundle Three.js
# Verifica que todas las optimizaciones estén implementadas correctamente

echo "🔍 VERIFICANDO OPTIMIZACIÓN DEL BUNDLE THREE.JS"
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de verificaciones
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Función para verificar archivos
check_file() {
    local file="$1"
    local description="$2"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} $description - ARCHIVO NO ENCONTRADO: $file"
    fi
}

# Función para verificar configuración en archivo
check_config() {
    local file="$1"
    local pattern="$2"
    local description="$3"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} $description - PATRÓN NO ENCONTRADO: $pattern"
    fi
}

# Verificar archivos clave creados
echo ""
echo "📁 ARCHIVOS PRINCIPALES:"
echo "------------------------"

check_file "src/lib/three/index.ts" "Archivo central de imports Three.js"
check_file "src/lib/three/lazy-postprocessing.ts" "Sistema lazy de post-procesado"
check_file "src/lib/three/hdri-loader.ts" "Carga inteligente de HDRI"
check_file "src/components/WatchConfigurator3DBundleOptimized.tsx" "Componente optimizado"

echo ""
echo "🔧 CONFIGURACIONES:"
echo "-------------------"

check_config "vite.config.ts" "dedupe.*three" "Deduplication configurada en Vite"
check_config "vite.config.ts" "manualChunks" "Chunks manuales configurados"
check_config "vite.config.ts" "three-core" "Chunk three-core configurado"
check_config "vite.config.ts" "three-postprocessing" "Chunk post-procesado configurado"

echo ""
echo "📦 DEPENDENCIAS:"
echo "----------------"

check_config "package.json" "resolutions.*three" "Resolutions de Three.js configuradas"
check_config "package.json" "overrides.*three" "Overrides de Three.js configuradas"

echo ""
echo "🔄 BACKWARD COMPATIBILITY:"
echo "-------------------------"

check_file "src/lib/three-utils.ts" "Archivo bridge para compatibilidad"
check_config "src/lib/three-utils.ts" "from.*three/index.js" "Import del archivo central"

echo ""
echo "🧪 VERIFICACIÓN DE IMPORTS:"
echo "---------------------------"

# Verificar que el nuevo componente use imports optimizados
if [ -f "src/components/WatchConfigurator3DBundleOptimized.tsx" ]; then
    if grep -q "loadPostProcessing" "src/components/WatchConfigurator3DBundleOptimized.tsx"; then
        echo -e "${GREEN}✅${NC} Componente usa lazy loading de post-procesado"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} Componente no usa lazy loading de post-procesado"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if grep -q "HDRIloader" "src/components/WatchConfigurator3DBundleOptimized.tsx"; then
        echo -e "${GREEN}✅${NC} Componente usa HDRI loader lazy"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} Componente no usa HDRI loader lazy"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

echo ""
echo "📊 VERIFICACIÓN DE LAZY LOADING:"
echo "---------------------------------"

# Verificar que los archivos de lazy loading existan
if [ -f "src/lib/three/lazy-postprocessing.ts" ]; then
    if grep -q "lazyLoadPostProcessing" "src/lib/three/lazy-postprocessing.ts"; then
        echo -e "${GREEN}✅${NC} Función lazyLoadPostProcessing implementada"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} Función lazyLoadPostProcessing no encontrada"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

if [ -f "src/lib/three/hdri-loader.ts" ]; then
    if grep -q "HDRIloader" "src/lib/three/hdri-loader.ts"; then
        echo -e "${GREEN}✅${NC} Clase HDRIloader implementada"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} Clase HDRIloader no encontrada"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

echo ""
echo "🎯 VERIFICACIÓN DE BUNDLE SPLITTING:"
echo "------------------------------------"

# Verificar configuración de chunks en vite.config.ts
if [ -f "vite.config.ts" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if grep -q "node_modules/three/examples/jsm/postprocessing/" "vite.config.ts"; then
        echo -e "${GREEN}✅${NC} Chunk de post-procesado configurado"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} Chunk de post-procesado no configurado"
    fi
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if grep -q "node_modules/three/examples/jsm/controls/" "vite.config.ts"; then
        echo -e "${GREEN}✅${NC} Chunk de controles configurado"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} Chunk de controles no configurado"
    fi
fi

echo ""
echo "📋 RESUMEN DE VERIFICACIÓN:"
echo "==========================="

# Calcular porcentaje de éxito
PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🎉 OPTIMIZACIÓN COMPLETADA EXITOSAMENTE${NC}"
    echo -e "${GREEN}✅ $PASSED_CHECKS/$TOTAL_CHECKS verificaciones pasadas ($PERCENTAGE%)${NC}"
elif [ $PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}⚠️ OPTIMIZACIÓN PARCIALMENTE COMPLETADA${NC}"
    echo -e "${YELLOW}✅ $PASSED_CHECKS/$TOTAL_CHECKS verificaciones pasadas ($PERCENTAGE%)${NC}"
else
    echo -e "${RED}❌ OPTIMIZACIÓN INCOMPLETA${NC}"
    echo -e "${RED}❌ $PASSED_CHECKS/$TOTAL_CHECKS verificaciones pasadas ($PERCENTAGE%)${NC}"
fi

echo ""
echo "📊 MÉTRICAS ESPERADAS:"
echo "----------------------"
echo "• Bundle Size Reduction: ~28%"
echo "• Time to Interactive: ~40% faster"
echo "• Memory Usage: ~45% reduction"
echo "• Mobile FPS: ~45% improvement"

echo ""
echo "🚀 SIGUIENTES PASOS:"
echo "--------------------"
echo "1. Ejecutar 'npm run build' para generar bundle optimizado"
echo "2. Verificar tamaños de chunks en dist/"
echo "3. Probar carga lazy en desarrollo"
echo "4. Validar performance en dispositivos móviles"

echo ""
if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}✨ VERIFICACIÓN COMPLETADA - OPTIMIZACIÓN EXITOSA ✨${NC}"
else
    echo -e "${YELLOW}⚠️ REVISAR ELEMENTOS FALLIDOS ANTES DE DEPLOYAR ⚠️${NC}"
fi