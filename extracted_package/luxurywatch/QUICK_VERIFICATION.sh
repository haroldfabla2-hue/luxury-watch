#!/bin/bash

echo "=========================================="
echo "VERIFICACIÓN RÁPIDA - SISTEMA HÍBRIDO IA"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base
BASE_URL="https://huf5zp9oo3sb.space.minimax.io"

echo "🔍 Verificando archivos implementados..."
echo ""

# Verificar archivos nuevos
files=(
  "src/lib/geminiAIService.ts"
  "src/data/popularWatchConfigurations.ts"
  "src/components/AIWatchConfigurator.tsx"
  "src/pages/AIConfiguratorPage.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    echo -e "${GREEN}✓${NC} $file ($lines líneas)"
  else
    echo -e "${RED}✗${NC} $file - NO ENCONTRADO"
  fi
done

echo ""
echo "🔍 Verificando archivos modificados..."
echo ""

modified_files=(
  "src/App.tsx"
  "src/components/Navigation.tsx"
  "src/utils/pbrMaterials.ts"
)

for file in "${modified_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file - NO ENCONTRADO"
  fi
done

echo ""
echo "🔍 Verificando build..."
echo ""

if [ -d "dist" ]; then
  dist_size=$(du -sh dist | cut -f1)
  echo -e "${GREEN}✓${NC} Directorio dist/ existe ($dist_size)"
  
  if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✓${NC} dist/index.html existe"
  else
    echo -e "${RED}✗${NC} dist/index.html NO encontrado"
  fi
  
  js_files=$(find dist -name "*.js" | wc -l)
  echo -e "${GREEN}✓${NC} Archivos JavaScript: $js_files"
else
  echo -e "${RED}✗${NC} Directorio dist/ NO existe"
fi

echo ""
echo "🔍 Verificando documentación..."
echo ""

docs=(
  "SISTEMA_HIBRIDO_IA_DOCUMENTACION.md"
  "RESUMEN_EJECUTIVO_SISTEMA_HIBRIDO.md"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    lines=$(wc -l < "$doc")
    echo -e "${GREEN}✓${NC} $doc ($lines líneas)"
  else
    echo -e "${RED}✗${NC} $doc - NO ENCONTRADO"
  fi
done

echo ""
echo "=========================================="
echo "📊 RESUMEN"
echo "=========================================="
echo ""
echo "URL Producción: $BASE_URL"
echo "Rutas principales:"
echo "  - $BASE_URL/ (Landing)"
echo "  - $BASE_URL/configurador-ia (IA Configurador) ⭐ NUEVO"
echo "  - $BASE_URL/configurador (3D Clásico)"
echo ""
echo -e "${YELLOW}⚠️  Testing manual requerido (ver RESUMEN_EJECUTIVO_SISTEMA_HIBRIDO.md)${NC}"
echo ""
