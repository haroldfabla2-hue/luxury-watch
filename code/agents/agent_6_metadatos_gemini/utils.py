"""
Utilidades y funciones helper para el Agente 6: Generador de Metadatos y SEO

Este módulo proporciona funciones de conveniencia para facilitar el uso
del agente en diferentes contextos y casos de uso.
"""

import json
import csv
import os
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import logging

from .types import ComponenteReloj, MetadatosGenerados, AudienciaTarget
from .agent import AgenteMetadatosGemini
from .config import create_production_config, ConfiguracionAgente


class AgenteHelper:
    """
    Clase helper que proporciona funciones de conveniencia para el Agente 6.
    
    Simplifica el uso común del agente para tareas frecuentes.
    """
    
    def __init__(self, config: Optional[ConfiguracionAgente] = None):
        """
        Inicializa el helper.
        
        Args:
            config: Configuración del agente (opcional, usa producción por defecto)
        """
        if config is None:
            config = create_production_config()
        
        self.config = config
        self.agente = AgenteMetadatosGemini(config)
        self.logger = logging.getLogger(__name__)
    
    async def procesar_componente_rapido(
        self, 
        datos_componente: Dict[str, Any],
        audiencia_principal: AudienciaTarget = AudienciaTarget.COMERCIAL
    ) -> Dict[str, Any]:
        """
        Procesa un componente de forma rápida con configuración simplificada.
        
        Args:
            datos_componente: Datos del componente en formato diccionario
            audiencia_principal: Audiencia principal para el contenido
            
        Returns:
            Resultado simplificado con los datos más importantes
        """
        try:
            # Convertir dict a ComponenteReloj
            componente = self._dict_a_componente(datos_componente)
            
            # Procesar con solo la audiencia principal
            metadatos = await self.agente.procesar_componente_completo(
                componente=componente,
                audiencias=[audiencia_principal]
            )
            
            # Retornar resultado simplificado
            return {
                "exito": True,
                "componente_id": componente.id,
                "titulo_seo": metadatos.seo_metadata.titulo_seo if metadatos.seo_metadata else None,
                "descripcion_seo": metadatos.seo_metadata.descripcion_seo if metadatos.seo_metadata else None,
                "descripcion_principal": metadatos.descripciones[0].descripcion if metadatos.descripciones else None,
                "json_ld": metadatos.json_ld,
                "keywords_principales": metadatos.seo_metadata.keywords.primarias if metadatos.seo_metadata else [],
                "tiempo_procesamiento": metadatos.tiempo_procesamiento,
                "seo_score": metadatos.seo_score
            }
            
        except Exception as e:
            self.logger.error(f"Error en procesamiento rápido: {e}")
            return {
                "exito": False,
                "error": str(e),
                "componente_id": datos_componente.get("id", "unknown")
            }
    
    async def procesar_lote_rapido(
        self, 
        lista_componentes: List[Dict[str, Any]],
        audiencia_principal: AudienciaTarget = AudienciaTarget.COMERCIAL
    ) -> List[Dict[str, Any]]:
        """
        Procesa múltiples componentes de forma rápida.
        
        Args:
            lista_componentes: Lista de datos de componentes
            audiencia_principal: Audiencia principal
            
        Returns:
            Lista de resultados simplificados
        """
        resultados = []
        
        for i, datos_comp in enumerate(lista_componentes):
            try:
                self.logger.info(f"Procesando componente {i+1}/{len(lista_componentes)}")
                
                resultado = await self.procesar_componente_rapido(datos_comp, audiencia_principal)
                resultados.append(resultado)
                
            except Exception as e:
                self.logger.error(f"Error procesando componente {i}: {e}")
                resultados.append({
                    "exito": False,
                    "error": str(e),
                    "componente_id": datos_comp.get("id", f"comp_{i}")
                })
        
        return resultados
    
    def _dict_a_componente(self, datos: Dict[str, Any]) -> ComponenteReloj:
        """Convierte diccionario a ComponenteReloj."""
        from .types import TipoComponente, MaterialBase, AcabadoSuperficie, EstiloVisual
        
        # Convertir enums si es necesario
        tipo = datos.get("tipo")
        if isinstance(tipo, str):
            tipo = TipoComponente(tipo)
        
        material = datos.get("material_base")
        if isinstance(material, str):
            material = MaterialBase(material)
        
        acabado = datos.get("acabado_superficie")
        if isinstance(acabado, str):
            acabado = AcabadoSuperficie(acabado)
        
        estilos = datos.get("estilo_visual", [])
        if estilos and isinstance(estilos[0], str):
            estilos = [EstiloVisual(s) for s in estilos]
        
        return ComponenteReloj(
            id=datos["id"],
            tipo=tipo,
            nombre=datos["nombre"],
            descripcion_tecnica=datos.get("descripcion_tecnica"),
            material_base=material,
            acabado_superficie=acabado,
            color_principal=datos.get("color_principal"),
            estilo_visual=estilos,
            coleccion=datos.get("coleccion"),
            resistencia_agua=datos.get("resistencia_agua"),
            peso=datos.get("peso"),
            dimensiones=datos.get("dimensiones", {}),
            modelo_3d_url=datos.get("modelo_3d_url")
        )
    
    def exportar_resultados_csv(
        self, 
        resultados: List[Dict[str, Any]], 
        archivo_salida: str
    ) -> bool:
        """
        Exporta resultados a archivo CSV.
        
        Args:
            resultados: Lista de resultados del procesamiento
            archivo_salida: Ruta del archivo CSV de salida
            
        Returns:
            True si se exportó exitosamente
        """
        try:
            if not resultados:
                self.logger.warning("No hay resultados para exportar")
                return False
            
            # Definir columnas para el CSV
            columnas = [
                "componente_id",
                "exito",
                "titulo_seo", 
                "descripcion_seo",
                "descripcion_principal",
                "keywords_principales",
                "tiempo_procesamiento",
                "seo_score",
                "error"
            ]
            
            with open(archivo_salida, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=columnas)
                writer.writeheader()
                
                for resultado in resultados:
                    row = {col: resultado.get(col, "") for col in columnas}
                    
                    # Convertir listas a strings para CSV
                    if isinstance(row["keywords_principales"], list):
                        row["keywords_principales"] = "; ".join(row["keywords_principales"])
                    
                    if isinstance(row["error"], dict):
                        row["error"] = str(row["error"])
                    
                    writer.writerow(row)
            
            self.logger.info(f"Resultados exportados a {archivo_salida}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error exportando CSV: {e}")
            return False
    
    def exportar_resultados_json(
        self, 
        resultados: List[Dict[str, Any]], 
        archivo_salida: str,
        incluir_json_ld: bool = True
    ) -> bool:
        """
        Exporta resultados a archivo JSON.
        
        Args:
            resultados: Lista de resultados del procesamiento
            archivo_salida: Ruta del archivo JSON de salida
            incluir_json_ld: Si incluir el JSON-LD completo
            
        Returns:
            True si se exportó exitosamente
        """
        try:
            # Filtrar campos grandes si no se incluyen
            resultados_export = []
            for resultado in resultados:
                resultado_copy = resultado.copy()
                
                if not incluir_json_ld and "json_ld" in resultado_copy:
                    resultado_copy["json_ld"] = "omitido"
                
                resultados_export.append(resultado_copy)
            
            with open(archivo_salida, 'w', encoding='utf-8') as jsonfile:
                json.dump(
                    resultados_export, 
                    jsonfile, 
                    indent=2, 
                    ensure_ascii=False,
                    default=str
                )
            
            self.logger.info(f"Resultados exportados a {archivo_salida}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error exportando JSON: {e}")
            return False
    
    def generar_resumen_resultados(self, resultados: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Genera un resumen estadístico de los resultados.
        
        Args:
            resultados: Lista de resultados del procesamiento
            
        Returns:
            Diccionario con resumen estadístico
        """
        total = len(resultados)
        exitosos = sum(1 for r in resultados if r.get("exito", False))
        fallidos = total - exitosos
        
        tiempo_promedio = 0
        seo_scores = []
        palabras_clave_totales = 0
        
        for resultado in resultados:
            if resultado.get("exito"):
                tiempo = resultado.get("tiempo_procesamiento", 0)
                if tiempo:
                    tiempo_promedio += tiempo
                
                seo_score = resultado.get("seo_score")
                if seo_score:
                    seo_scores.append(seo_score)
                
                keywords = resultado.get("keywords_principales", [])
                if isinstance(keywords, list):
                    palabras_clave_totales += len(keywords)
        
        if exitosos > 0:
            tiempo_promedio /= exitosos
            seo_score_promedio = sum(seo_scores) / len(seo_scores) if seo_scores else 0
        else:
            tiempo_promedio = 0
            seo_score_promedio = 0
        
        return {
            "total_procesados": total,
            "exitosos": exitosos,
            "fallidos": fallidos,
            "tasa_exito": f"{(exitosos/total*100):.1f}%" if total > 0 else "0%",
            "tiempo_promedio_procesamiento": f"{tiempo_promedio:.2f}s",
            "seo_score_promedio": f"{seo_score_promedio:.1f}/100",
            "keywords_totales_generadas": palabras_clave_totales,
            "timestamp": datetime.now().isoformat()
        }
    
    async def generar_sitemap_urls(
        self, 
        resultados: List[Dict[str, Any]],
        base_url: str = "https://luxurywatch.com"
    ) -> List[Dict[str, str]]:
        """
        Genera URLs para sitemap basadas en los resultados.
        
        Args:
            resultados: Resultados del procesamiento
            base_url: URL base del sitio
            
        Returns:
            Lista de URLs para sitemap
        """
        urls = []
        
        for resultado in resultados:
            if resultado.get("exito"):
                componente_id = resultado.get("componente_id")
                if componente_id:
                    url = f"{base_url}/productos/{componente_id}"
                    
                    urls.append({
                        "loc": url,
                        "lastmod": datetime.now().strftime("%Y-%m-%d"),
                        "changefreq": "monthly",
                        "priority": "0.8"
                    })
        
        return urls
    
    def crear_metadatos_batch_csv(self, archivo_csv: str) -> List[Dict[str, Any]]:
        """
        Crea lista de componentes desde archivo CSV.
        
        Args:
            archivo_csv: Ruta del archivo CSV con datos de componentes
            
        Returns:
            Lista de diccionarios con datos de componentes
        """
        try:
            componentes = []
            
            with open(archivo_csv, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    # Mapear columnas CSV a formato de componente
                    componente = {
                        "id": row.get("id", f"comp_{len(componentes)+1}"),
                        "nombre": row.get("nombre", ""),
                        "tipo": row.get("tipo", "caja"),
                        "material_base": row.get("material_base"),
                        "color_principal": row.get("color_principal"),
                        "descripcion_tecnica": row.get("descripcion"),
                        "coleccion": row.get("coleccion"),
                        "resistencia_agua": int(row.get("resistencia_agua", 0)) if row.get("resistencia_agua") else None,
                        "peso": float(row.get("peso", 0)) if row.get("peso") else None
                    }
                    
                    # Limpiar valores vacíos
                    componente = {k: v for k, v in componente.items() if v}
                    
                    componentes.append(componente)
            
            self.logger.info(f"Cargados {len(componentes)} componentes desde CSV")
            return componentes
            
        except Exception as e:
            self.logger.error(f"Error cargando CSV: {e}")
            return []
    
    def validar_datos_componente(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida datos de componente y retorna errores o advertencias.
        
        Args:
            datos: Datos del componente a validar
            
        Returns:
            Diccionario con validación
        """
        errores = []
        advertencias = []
        
        # Campos requeridos
        campos_requeridos = ["id", "nombre", "tipo"]
        for campo in campos_requeridos:
            if not datos.get(campo):
                errores.append(f"Campo requerido faltante: {campo}")
        
        # Validar tipo
        tipo = datos.get("tipo")
        if tipo:
            try:
                from .types import TipoComponente
                TipoComponente(tipo)
            except ValueError:
                errores.append(f"Tipo inválido: {tipo}")
        
        # Validar material si existe
        material = datos.get("material_base")
        if material:
            try:
                from .types import MaterialBase
                MaterialBase(material)
            except ValueError:
                advertencias.append(f"Material no reconocido: {material}")
        
        # Validaciones de formato
        if datos.get("peso") and not isinstance(datos["peso"], (int, float)):
            errores.append("Peso debe ser numérico")
        
        if datos.get("resistencia_agua") and not isinstance(datos["resistencia_agua"], int):
            errores.append("Resistencia al agua debe ser un número entero")
        
        return {
            "valido": len(errores) == 0,
            "errores": errores,
            "advertencias": advertencias,
            "nivel_validacion": "error" if errores else "warning" if advertencias else "ok"
        }


# Funciones de conveniencia de alto nivel

async def procesar_componente_simple(
    nombre: str,
    tipo: str,
    material: Optional[str] = None,
    color: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Procesa un componente con parámetros simplificados.
    
    Args:
        nombre: Nombre del componente
        tipo: Tipo de componente
        material: Material base (opcional)
        color: Color principal (opcional)
        **kwargs: Parámetros adicionales
        
    Returns:
        Resultado del procesamiento
    """
    helper = AgenteHelper()
    
    datos_componente = {
        "id": f"comp_{nombre.lower().replace(' ', '_')}",
        "nombre": nombre,
        "tipo": tipo,
        **kwargs
    }
    
    if material:
        datos_componente["material_base"] = material
    
    if color:
        datos_componente["color_principal"] = color
    
    return await helper.procesar_componente_rapido(datos_componente)


def crear_agente_rapido(config_path: Optional[str] = None) -> AgenteHelper:
    """
    Crea una instancia del agente con configuración rápida.
    
    Args:
        config_path: Ruta a archivo de configuración (opcional)
        
    Returns:
        Instancia del helper configurada
    """
    if config_path and os.path.exists(config_path):
        # Cargar configuración desde archivo si existe
        with open(config_path, 'r') as f:
            import yaml
            config_data = yaml.safe_load(f)
        
        # Crear configuración desde datos
        config = ConfiguracionAgente(**config_data)
        return AgenteHelper(config)
    else:
        # Usar configuración por defecto
        return AgenteHelper()


async def procesar_lote_desde_csv(
    archivo_csv: str,
    audiencia: AudienciaTarget = AudienciaTarget.COMERCIAL
) -> Dict[str, Any]:
    """
    Procesa componentes desde archivo CSV de forma automática.
    
    Args:
        archivo_csv: Ruta del archivo CSV
        audiencia: Audiencia objetivo
        
    Returns:
        Resumen completo del procesamiento
    """
    helper = AgenteHelper()
    
    # Cargar datos desde CSV
    componentes = helper.crear_metadatos_batch_csv(archivo_csv)
    
    if not componentes:
        return {"error": "No se pudieron cargar componentes del CSV"}
    
    # Validar componentes
    componentes_validos = []
    errores_validacion = []
    
    for comp in componentes:
        validacion = helper.validar_datos_componente(comp)
        if validacion["valido"]:
            componentes_validos.append(comp)
        else:
            errores_validacion.append({
                "componente": comp.get("id", "unknown"),
                "errores": validacion["errores"]
            })
    
    # Procesar lote
    resultados = await helper.procesar_lote_rapido(componentes_validos, audiencia)
    
    # Generar resumen
    resumen = helper.generar_resumen_resultados(resultados)
    resumen["componentes_cargados"] = len(componentes)
    resumen["componentes_validos"] = len(componentes_validos)
    resumen["errores_validacion"] = errores_validacion
    
    return resumen


async def generar_reporte_completo(
    resultados: List[Dict[str, Any]], 
    incluir_archivos: bool = True
) -> Dict[str, Any]:
    """
    Genera un reporte completo del procesamiento.
    
    Args:
        resultados: Resultados del procesamiento
        incluir_archivos: Si crear archivos de salida
        
    Returns:
        Reporte completo
    """
    helper = AgenteHelper()
    
    # Generar resumen
    resumen = helper.generar_resumen_resultados(resultados)
    
    reporte = {
        "resumen": resumen,
        "resultados": resultados,
        "timestamp": datetime.now().isoformat()
    }
    
    if incluir_archivos:
        # Crear archivos de salida
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Exportar CSV
        csv_file = f"metadatos_resultados_{timestamp}.csv"
        helper.exportar_resultados_csv(resultados, csv_file)
        reporte["archivos_generados"] = {"csv": csv_file}
        
        # Exportar JSON
        json_file = f"metadatos_resultados_{timestamp}.json"
        helper.exportar_resultados_json(resultados, json_file)
        reporte["archivos_generados"]["json"] = json_file
        
        # Generar sitemap
        urls_sitemap = await helper.generar_sitemap_urls(resultados)
        sitemap_file = f"sitemap_urls_{timestamp}.json"
        with open(sitemap_file, 'w') as f:
            json.dump(urls_sitemap, f, indent=2)
        reporte["archivos_generados"]["sitemap"] = sitemap_file
    
    return reporte


# Ejemplo de uso
if __name__ == "__main__":
    async def ejemplo_uso_helper():
        """Ejemplo de uso del helper."""
        print("🚀 Ejemplo de uso del AgenteHelper")
        
        # Crear helper
        helper = AgenteHelper()
        
        # Procesar componente simple
        resultado = await procesar_componente_simple(
            nombre="Bisel Cerámica Negra",
            tipo="bisel",
            material="ceramica",
            color="negro"
        )
        
        print(f"Resultado: {resultado}")
        
        # Generar reporte si hay resultados
        if resultado["exito"]:
            reporte = await generar_reporte_completo([resultado])
            print(f"Reporte generado: {reporte['resumen']}")
    
    import asyncio
    asyncio.run(ejemplo_uso_helper())