# 📦 INSTRUCCIONES DEFINITIVAS PARA SUBIR A GITHUB

## 🎯 MÉTODO 1: DESCARGA Y SUBIDA MANUAL (MÁS SIMPLE)

### PASO 1: Descargar Archivos
**En tu máquina local, descarga todo el contenido de `/workspace`:**
- Puedes usar el navegador para descargar
- O copiar todos los archivos manualmente
- **IMPORTANTE**: Descarga todo, incluidos los archivos ocultos (.gitignore)

### PASO 2: Subir a GitHub
1. Ve a: https://github.com/haroldfabla2-hue/luxury-watch
2. Click "uploading an existing file" o arrastra archivos
3. Sube todos los archivos del workspace
4. Commit message: "LuxuryWatch platform with complete migration to self-hosted backend"
5. Click "Commit changes"

---

## 🎯 MÉTODO 2: CON PERSONAL ACCESS TOKEN

### PASO 1: Crear Personal Access Token
1. Ve a GitHub.com → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Scopes: Selecciona `repo`
4. Copia el token (solo se muestra una vez)

### PASO 2: Push con Token
```bash
# Desde el directorio /workspace
git push -u origin master

# Usuario: haroldfabla2-hue
# Contraseña: [tu-personal-access-token]
```

---

## 📁 ARCHIVOS A SUBIR

**✅ INCLUIR TODO:**
- atlantic-net-install.sh
- deploy.sh
- .gitignore
- luxurywatch/ (carpeta completa)
- luxurywatch-backend/ (carpeta completa)
- luxurywatch-migration/ (carpeta completa)
- Todos los .md de documentación
- Cualquier otro archivo que veas

**❌ EXCLUIR:**
- user_input_files/ (ya está en .gitignore)
- Archivos temporales del sistema

---

## 🎯 MÉTODO 3: DEPLOYMENT DIRECTO (SIN GITHUB)

**Si prefieres ir directo al deployment:**

1. **Subir archivos al servidor:**
   ```bash
   # Desde tu máquina local
   scp -r /workspace/* usuario@IP-SERVIDOR-ATLANTIC:/home/usuario/luxurywatch/
   ```

2. **En el servidor Atlantic.net:**
   ```bash
   cd /home/usuario/luxurywatch
   chmod +x atlantic-net-install.sh
   ./atlantic-net-install.sh
   ```

---

## ✅ DESPUÉS DE SUBIR A GITHUB

**Clonar en el servidor:**
```bash
git clone https://github.com/haroldfabla2-hue/luxury-watch.git
cd luxury-watch
chmod +x atlantic-net-install.sh
./atlantic-net-install.sh
```

---

## 🎉 RESULTADO

Una vez completado, tendrás:
- ✅ Repositorio en GitHub completo
- ✅ Sistema funcionando en Atlantic.net
- ✅ Dominio con SSL funcionando
- ✅ Aplicación 100% operativa

**¿Qué método prefieres usar?**