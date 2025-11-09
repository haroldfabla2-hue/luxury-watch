#!/bin/bash

echo "===== QA TESTING - LUXURYWATCH CONFIGURADOR OPTIMIZADO ====="
echo ""
echo "URL BASE: https://gfgjlkeb1uzn.space.minimax.io"
echo "FECHA: $(date)"
echo ""

# Test 1: Verificar páginas principales
echo "=== TEST 1: VERIFICACIÓN DE PÁGINAS ==="
echo ""
echo "1.1 Landing Page (/):"
curl -sI https://gfgjlkeb1uzn.space.minimax.io | grep -E "HTTP|Content-Type"
echo ""

echo "1.2 IA Configurador (/configurador-ia):"
curl -sI https://gfgjlkeb1uzn.space.minimax.io/configurador-ia | grep -E "HTTP|Content-Type"
echo ""

echo "1.3 Configurador Optimizado (/configurador-optimizado):"
curl -sI https://gfgjlkeb1uzn.space.minimax.io/configurador-optimizado | grep -E "HTTP|Content-Type"
echo ""

echo "1.4 Configurador 3D (/configurador):"
curl -sI https://gfgjlkeb1uzn.space.minimax.io/configurador | grep -E "HTTP|Content-Type"
echo ""

# Test 2: Verificar assets críticos
echo "=== TEST 2: VERIFICACIÓN DE ASSETS ==="
echo ""
echo "2.1 JavaScript principal:"
curl -sI https://gfgjlkeb1uzn.space.minimax.io/assets/index-Tmut9c3C.js | grep -E "HTTP|Content-Type|Content-Length"
echo ""

echo "2.2 CSS principal:"
curl -sI https://gfgjlkeb1uzn.space.minimax.io/assets/index-BkAsBSbP.css | grep -E "HTTP|Content-Type|Content-Length"
echo ""

echo "2.3 Imágenes pre-procesadas (sample):"
curl -sI https://gfgjlkeb1uzn.space.minimax.io/static-watches/gold_white_classic_frontal.png | grep -E "HTTP|Content-Type"
echo ""

# Test 3: Verificar código fuente contiene las implementaciones
echo "=== TEST 3: VERIFICACIÓN DE IMPLEMENTACIÓN EN BUILD ==="
echo ""
echo "3.1 Buscar ruta configurador-optimizado en bundle:"
if curl -s https://gfgjlkeb1uzn.space.minimax.io/assets/index-Tmut9c3C.js | grep -q "configurador-optimizado"; then
    echo "✓ Ruta /configurador-optimizado ENCONTRADA en bundle"
else
    echo "✗ Ruta /configurador-optimizado NO encontrada"
fi
echo ""

echo "3.2 Buscar handleCustomizeMore en bundle:"
if curl -s https://gfgjlkeb1uzn.space.minimax.io/assets/index-Tmut9c3C.js | grep -q "handleCustomizeMore"; then
    echo "✓ Función handleCustomizeMore ENCONTRADA en bundle"
else
    echo "✗ Función handleCustomizeMore NO encontrada"
fi
echo ""

echo "3.3 Buscar PreProcessedWatchViewer en bundle:"
if curl -s https://gfgjlkeb1uzn.space.minimax.io/assets/index-Tmut9c3C.js | grep -q "PreProcessedWatchViewer"; then
    echo "✓ Componente PreProcessedWatchViewer ENCONTRADO en bundle"
else
    echo "✗ Componente PreProcessedWatchViewer NO encontrado"
fi
echo ""

echo "===== FIN DE PRUEBAS AUTOMATIZADAS ====="
