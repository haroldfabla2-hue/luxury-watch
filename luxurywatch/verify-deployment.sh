#!/bin/bash
# Script de verificación automática del Configurador 3D WebGL
# Este script verifica que el deploy es exitoso y la página carga correctamente

echo "🔍 VERIFICACIÓN AUTOMÁTICA DEL CONFIGURADOR 3D"
echo "=============================================="
echo ""

URL="https://5nsxosy3ayh7.space.minimax.io/configurador"

echo "📡 Verificando conectividad..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Página accesible (HTTP $HTTP_CODE)"
else
    echo "❌ Error de conectividad (HTTP $HTTP_CODE)"
    exit 1
fi

echo ""
echo "📦 Verificando assets JavaScript..."
MAIN_PAGE=$(curl -s "$URL")

# Verificar que hay scripts cargados
SCRIPT_COUNT=$(echo "$MAIN_PAGE" | grep -o '<script' | wc -l)
echo "✅ Scripts encontrados: $SCRIPT_COUNT"

# Verificar que Three.js está incluido
if echo "$MAIN_PAGE" | grep -q "three-core"; then
    echo "✅ Three.js core detectado en bundle"
else
    echo "⚠️  Three.js core no detectado en HTML"
fi

# Verificar configurador 3D
if echo "$MAIN_PAGE" | grep -q "WatchConfigurator3DVanilla"; then
    echo "✅ WatchConfigurator3DVanilla detectado en bundle"
else
    echo "⚠️  WatchConfigurator3DVanilla no detectado"
fi

echo ""
echo "🎯 Verificación de estructura HTML..."

# Verificar root div
if echo "$MAIN_PAGE" | grep -q 'id="root"'; then
    echo "✅ Root div presente"
else
    echo "❌ Root div no encontrado"
fi

# Verificar meta tags
if echo "$MAIN_PAGE" | grep -q 'viewport'; then
    echo "✅ Meta viewport presente"
else
    echo "⚠️  Meta viewport no encontrado"
fi

echo ""
echo "=============================================="
echo "✅ VERIFICACIÓN BÁSICA COMPLETADA"
echo ""
echo "⚠️  IMPORTANTE: Esta verificación solo confirma que la página"
echo "    carga correctamente. Para verificar errores WebGL y el"
echo "    renderizado 3D, es NECESARIO abrir en un navegador:"
echo ""
echo "    🔗 $URL"
echo ""
echo "    Y seguir: docs/VERIFICACIÓN_WEBGL_MANUAL.md"
echo ""
