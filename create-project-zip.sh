#!/bin/bash

# Script para comprimir el proyecto excluyendo user_input_files
# Ejecutar desde el directorio /workspace

echo "🗂️ CREANDO ARCHIVO ZIP PARA GITHUB"

# Crear directorio temporal
mkdir -p /tmp/luxurywatch-project

# Copiar todos los archivos excepto user_input_files
echo "📦 Copiando archivos del proyecto..."
find /workspace -type f -not -path "*/user_input_files/*" -exec cp --parents {} /tmp/luxurywatch-project/ \;

# Copiar directorios importantes
echo "📁 Copiando directorios principales..."
cp -r /workspace/luxurywatch /tmp/luxurywatch-project/ 2>/dev/null || echo "luxurywatch/ no encontrado"
cp -r /workspace/luxurywatch-backend /tmp/luxurywatch-project/ 2>/dev/null || echo "luxurywatch-backend/ no encontrado"
cp -r /workspace/luxurywatch-migration /tmp/luxurywatch-project/ 2>/dev/null || echo "luxurywatch-migration/ no encontrado"

# Copiar scripts principales
cp /workspace/atlantic-net-install.sh /tmp/luxurywatch-project/ 2>/dev/null || echo "atlantic-net-install.sh no encontrado"
cp /workspace/deploy.sh /tmp/luxurywatch-project/ 2>/dev/null || echo "deploy.sh no encontrado"
cp /workspace/.gitignore /tmp/luxurywatch-project/ 2>/dev/null || echo ".gitignore no encontrado"

# Copiar documentación
find /workspace -name "*.md" -not -path "*/user_input_files/*" -exec cp {} /tmp/luxurywatch-project/ \;

# Crear el archivo ZIP
echo "🗜️ Creando archivo ZIP..."
cd /tmp
zip -r luxurywatch-complete-project.zip luxurywatch-project/

echo "✅ Archivo creado: /tmp/luxurywatch-complete-project.zip"
echo "📁 Contenido disponible en: /tmp/luxurywatch-project/"

# Mostrar contenido del proyecto
echo "📋 Contenido del proyecto:"
find /tmp/luxurywatch-project -type f | head -20