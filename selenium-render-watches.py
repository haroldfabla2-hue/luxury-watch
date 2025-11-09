#!/usr/bin/env python3
"""
Renderizador Automático de Relojes 3D usando Selenium
Captura automáticamente screenshots de todas las configuraciones de relojes
"""

import os
import sys
import time
import json
import base64
from datetime import datetime
from typing import List, Dict, Optional

# Instalar dependencias automáticamente si no están disponibles
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.action_chains import ActionChains
    from selenium.webdriver.common.keys import Keys
except ImportError:
    print("📦 Instalando Selenium...")
    os.system("pip install selenium webdriver-manager")
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.action_chures import ActionChains
    from selenium.webdriver.common.keys import Keys

class WatchRenderer:
    """Renderizador automático de configuraciones de relojes 3D"""
    
    def __init__(self):
        self.base_url = "https://r3095jalov3z.space.minimax.io"
        self.output_dir = "./renders_selenium"
        self.max_wait_time = 15
        self.delay_between_screenshots = 4
        
        # Configuraciones de relojes
        self.configurations = [
            # Acero inoxidable - 8 variaciones
            {
                "case": "acero_inoxidable",
                "dial": "blanca_lujo",
                "hands": "plateadas", 
                "crown": "acero",
                "strap": "acero_milanese",
                "complication": "simple_date",
                "bezel": "liso_acero",
                "size": "40mm"
            },
            {
                "case": "acero_inoxidable",
                "dial": "negra_premium",
                "hands": "plateadas",
                "crown": "acero", 
                "strap": "cuero_negro",
                "complication": "chronograph",
                "bezel": "tachymeter",
                "size": "42mm"
            },
            {
                "case": "acero_inoxidable",
                "dial": "azul_marina",
                "hands": "plateadas",
                "crown": "acero",
                "strap": "acero_milanese", 
                "complication": "moon_phase",
                "bezel": "diamantes",
                "size": "36mm"
            },
            {
                "case": "acero_inoxidable",
                "dial": "gris_technical",
                "hands": "plateadas",
                "crown": "acero",
                "strap": "caucuchou_negro",
                "complication": "gmt",
                "bezel": "ceramica_negra", 
                "size": "42mm"
            },
            {
                "case": "acero_inoxidable",
                "dial": "diamonds_white",
                "hands": "plateadas",
                "crown": "acero_diamond",
                "strap": "acero_milanese",
                "complication": "day_date",
                "bezel": "diamantes_completo",
                "size": "38mm"
            },
            {
                "case": "acero_inoxidable", 
                "dial": "carbon_tech",
                "hands": "plateadas",
                "crown": "acero",
                "strap": "caucuchou_blanco",
                "complication": "chronograph",
                "bezel": "ceramica_blanca",
                "size": "44mm"
            },
            {
                "case": "acero_inoxidable",
                "dial": "plateada_tech",
                "hands": "plateadas", 
                "crown": "acero",
                "strap": "acero_milanese",
                "complication": "perpetual_calendar",
                "bezel": "liso_acero",
                "size": "40mm"
            },
            {
                "case": "acero_inoxidable",
                "dial": "negra_extreme",
                "hands": "plateadas",
                "crown": "acero",
                "strap": "caucuchou_rojo",
                "complication": "extreme_complication",
                "bezel": "tachymeter_extreme",
                "size": "46mm"
            },
            
            # Oro 18k - 6 variaciones
            {
                "case": "oro_18k_amarillo",
                "dial": "champagne_elegante",
                "hands": "oro_amarillo",
                "crown": "oro_amarillo",
                "strap": "cuero_marrón",
                "complication": "simple_date",
                "bezel": "liso_oro",
                "size": "40mm"
            },
            {
                "case": "oro_18k_amarillo",
                "dial": "blanca_lujo",
                "hands": "oro_amarillo", 
                "crown": "oro_amarillo",
                "strap": "oro_milanese",
                "complication": "perpetual_calendar",
                "bezel": "diamantes",
                "size": "42mm"
            },
            {
                "case": "oro_18k_blanco",
                "dial": "plateada_premium",
                "hands": "oro_blanco",
                "crown": "oro_blanco",
                "strap": "cuero_negro",
                "complication": "chronograph",
                "bezel": "cingulado",
                "size": "38mm"
            },
            {
                "case": "oro_18k_blanco",
                "dial": "champagne_elegante",
                "hands": "oro_blanco",
                "crown": "oro_blanco",
                "strap": "oro_milanese", 
                "complication": "moon_phase",
                "bezel": "diamantes_premium",
                "size": "40mm"
            },
            {
                "case": "oro_18k_rosa",
                "dial": "rose_gold_elegant",
                "hands": "oro_rosa",
                "crown": "oro_rosa",
                "strap": "cuero_crema",
                "complication": "day_date",
                "bezel": "bisel_diamantes",
                "size": "38mm"
            },
            {
                "case": "oro_18k_rosa",
                "dial": "blanca_lujo",
                "hands": "oro_rosa",
                "crown": "oro_rosa",
                "strap": "oro_milanese",
                "complication": "gmt",
                "bezel": "diamantes_completo",
                "size": "42mm"
            },
            
            # Titanio - 4 variaciones
            {
                "case": "titanio_grado_5",
                "dial": "negra_premium",
                "hands": "plateadas",
                "crown": "titanio",
                "strap": "titanio_milanese",
                "complication": "simple_date",
                "bezel": "liso_titanio", 
                "size": "44mm"
            },
            {
                "case": "titanio_grado_5",
                "dial": "azul_technical",
                "hands": "plateadas",
                "crown": "titanio",
                "strap": "caucuchou_negro",
                "complication": "chronograph",
                "bezel": "tachymeter_titanio",
                "size": "42mm"
            },
            {
                "case": "titanio_grado_5",
                "dial": "plateada_tech",
                "hands": "plateadas",
                "crown": "titanio",
                "strap": "titanio_milanese",
                "complication": "gmt",
                "bezel": "ceramica_titanio",
                "size": "40mm"
            },
            {
                "case": "titanio_grado_5",
                "dial": "negra_technical",
                "hands": "oro_amarillo",
                "crown": "titanio",
                "strap": "caucuchou_azul",
                "complication": "day_night",
                "bezel": "ceramica_negra",
                "size": "46mm"
            },
            
            # Cerámica - 4 variaciones  
            {
                "case": "ceramica_negra",
                "dial": "negra_luxury",
                "hands": "oro_amarillo",
                "crown": "ceramica_negra",
                "strap": "ceramica_negra",
                "complication": "simple_date",
                "bezel": "ceramica_negra",
                "size": "41mm"
            },
            {
                "case": "ceramica_blanca",
                "dial": "blanca_lujo",
                "hands": "oro_blanco",
                "crown": "ceramica_blanca",
                "strap": "ceramica_blanca", 
                "complication": "moon_phase",
                "bezel": "ceramica_blanca",
                "size": "41mm"
            },
            {
                "case": "ceramica_azul",
                "dial": "azul_marina",
                "hands": "oro_rosa",
                "crown": "ceramica_azul",
                "strap": "ceramica_azul",
                "complication": "chronograph",
                "bezel": "ceramica_azul",
                "size": "41mm"
            },
            {
                "case": "ceramica_negra",
                "dial": "negra_luxury",
                "hands": "plateadas",
                "crown": "ceramica_negra",
                "strap": "ceramica_negra",
                "complication": "extreme_complication",
                "bezel": "ceramica_negra_diamond",
                "size": "43mm"
            },
            
            # Ediciones especiales - 4 variaciones
            {
                "case": "acero_inoxidable",
                "dial": "diamond_white",
                "hands": "diamante",
                "crown": "diamante_completo",
                "strap": "oro_milanese",
                "complication": "tourbillon",
                "bezel": "diamantes_completo",
                "size": "42mm"
            },
            {
                "case": "oro_18k_amarillo",
                "dial": "grand_complication",
                "hands": "oro_amarillo",
                "crown": "oro_amarillo_diamond",
                "strap": "cuero_crocodile",
                "complication": "grand_complication",
                "bezel": "diamantes_premium",
                "size": "44mm"
            },
            {
                "case": "titanio_grado_5",
                "dial": "technical_extreme",
                "hands": "plateadas",
                "crown": "titanio_diamond",
                "strap": "titanio_milanese",
                "complication": "extreme_complication", 
                "bezel": "ceramica_diamantes",
                "size": "48mm"
            },
            {
                "case": "ceramica_negra",
                "dial": "black_ultimate",
                "hands": "diamante",
                "crown": "ceramica_negra_diamond",
                "strap": "ceramica_negra",
                "complication": "ultimate_complication",
                "bezel": "ceramica_negra_ultimate",
                "size": "45mm"
            }
        ]
        
        self.setup_output_directory()
    
    def setup_output_directory(self):
        """Crear directorio de salida"""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            print(f"📁 Directorio creado: {self.output_dir}")
    
    def generate_filename(self, config: Dict, index: int) -> str:
        """Generar nombre de archivo para la configuración"""
        parts = [
            f"watch_{index:02d}",
            config["case"].replace(" ", "_").replace("-", "_"),
            config["dial"].replace(" ", "_").replace("-", "_"), 
            config["strap"].replace(" ", "_").replace("-", "_"),
            config["complication"].replace(" ", "_").replace("-", "_"),
            config["bezel"].replace(" ", "_").replace("-", "_"),
            config["size"].replace(" ", "_").replace("-", "")
        ]
        filename = "_".join(parts) + "_selenium.png"
        return filename.replace("__", "_").strip("_")
    
    def setup_chrome_options(self) -> Options:
        """Configurar opciones de Chrome"""
        chrome_options = Options()
        
        # Modo headless para automatizar
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--enable-webgl")
        
        # Configuración de viewport
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--device-scale-factor=2")
        
        # Configuración de rendimiento
        chrome_options.add_argument("--disable-background-timer-throttling")
        chrome_options.add_argument("--disable-backgrounding-occluded-windows")
        chrome_options.add_argument("--disable-renderer-backgrounding")
        
        # Configuración para captura de pantalla
        chrome_options.add_argument("--force-device-scale-factor=2")
        chrome_options.add_argument("--screenshot-without-viewport=false")
        
        return chrome_options
    
    def setup_driver(self) -> webdriver.Chrome:
        """Configurar y crear driver de Chrome"""
        chrome_options = self.setup_chrome_options()
        
        try:
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_window_size(1920, 1080)
            return driver
        except Exception as e:
            print(f"❌ Error creando driver: {e}")
            print("🔄 Intentando con webdriver-manager...")
            
            # Intentar con webdriver-manager
            try:
                from webdriver_manager.chrome import ChromeDriverManager
                from selenium.webdriver.chrome.service import Service
                
                service = Service(ChromeDriverManager().install())
                driver = webdriver.Chrome(service=service, options=chrome_options)
                driver.set_window_size(1920, 1080)
                return driver
            except Exception as e2:
                print(f"❌ Error con webdriver-manager: {e2}")
                sys.exit(1)
    
    def wait_for_canvas(self, driver: webdriver.Chrome) -> bool:
        """Esperar que el canvas 3D cargue"""
        try:
            WebDriverWait(driver, self.max_wait_time).until(
                EC.presence_of_element_located((By.TAG_NAME, "canvas"))
            )
            print("✅ Canvas 3D encontrado")
            return True
        except Exception as e:
            print(f"❌ Canvas no encontrado: {e}")
            return False
    
    def apply_configuration(self, driver: webdriver.Chrome, config: Dict) -> bool:
        """Aplicar configuración al reloj"""
        try:
            # Esperar carga completa
            time.sleep(3)
            
            # Buscar y interactuar con elementos de configuración
            # Esto depende de la implementación específica de tu configurador
            
            # Método 1: Buscar inputs y selects
            try:
                # Buscar selectores para cada componente
                case_selectors = [
                    "select[name*='case']", "select[name*='Caso']", 
                    "#case-select", ".case-selector"
                ]
                dial_selectors = [
                    "select[name*='dial']", "select[name*='Esfera']",
                    "#dial-select", ".dial-selector"
                ]
                strap_selectors = [
                    "select[name*='strap']", "select[name*='Correa']",
                    "#strap-select", ".strap-selector"
                ]
                
                # Aplicar caso
                self.select_option(driver, case_selectors, config.get("case", ""))
                time.sleep(1)
                
                # Aplicar esfera
                self.select_option(driver, dial_selectors, config.get("dial", ""))
                time.sleep(1)
                
                # Aplicar correa
                self.select_option(driver, strap_selectors, config.get("strap", ""))
                time.sleep(2)
                
                print(f"✅ Configuración aplicada: {config['case']} - {config['dial']}")
                return True
                
            except Exception as e:
                print(f"⚠️ Error aplicando configuración select: {e}")
                
                # Método 2: Usar JavaScript
                try:
                    script = f"""
                    // Disparar evento personalizado con configuración
                    window.dispatchEvent(new CustomEvent('updateWatchConfiguration', {{
                        detail: {json.dumps(config)}
                    }}));
                    
                    // Actualizar store de Zustand si está disponible
                    if (window.useConfiguratorStore) {{
                        window.useConfiguratorStore.getState().updateConfiguration({json.dumps(config)});
                    }}
                    """
                    
                    driver.execute_script(script)
                    time.sleep(3)
                    print(f"✅ Configuración aplicada vía JavaScript: {config['case']}")
                    return True
                    
                except Exception as e2:
                    print(f"❌ Error aplicando configuración JavaScript: {e2}")
                    return False
                    
        except Exception as e:
            print(f"❌ Error aplicando configuración: {e}")
            return False
    
    def select_option(self, driver: webdriver.Chrome, selectors: List[str], value: str) -> bool:
        """Seleccionar opción en un select"""
        for selector in selectors:
            try:
                select_element = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                )
                
                # Crear opciones
                options = select_element.find_elements(By.TAG_NAME, "option")
                for option in options:
                    if value.lower() in option.text.lower() or value.replace("_", " ").lower() in option.text.lower():
                        option.click()
                        return True
                        
            except Exception as e:
                continue
        return False
    
    def rotate_watch_for_multiple_angles(self, driver: webdriver.Chrome) -> List[str]:
        """Rotar el reloj para capturar múltiples ángulos"""
        angles = []
        canvas = driver.find_element(By.TAG_NAME, "canvas")
        
        angle_configs = [
            {"name": "frontal", "x": 0, "y": 0, "zoom": 1.0},
            {"name": "izquierda", "x": -400, "y": 0, "zoom": 1.2},
            {"name": "derecha", "x": 400, "y": 0, "zoom": 1.2},
            {"name": "superior", "x": 0, "y": -200, "zoom": 1.5},
            {"name": "perspectiva", "x": 200, "y": -100, "zoom": 1.1}
        ]
        
        for angle in angle_configs:
            try:
                # Simular drag para rotar
                actions = ActionChains(driver)
                actions.move_to_element(canvas)
                actions.move_by_offset(angle["x"], angle["y"])
                actions.click_and_hold()
                actions.move_by_offset(-angle["x"], -angle["y"])
                actions.release()
                actions.perform()
                
                time.sleep(1)
                angles.append(angle["name"])
                
            except Exception as e:
                print(f"⚠️ Error rotando a ángulo {angle['name']}: {e}")
        
        return angles
    
    def capture_screenshot(self, driver: webdriver.Chrome, filename: str) -> bool:
        """Capturar screenshot del canvas 3D"""
        try:
            # Capturar screenshot completo de la página
            driver.save_screenshot(filename)
            print(f"✅ Screenshot guardado: {filename}")
            return True
        except Exception as e:
            print(f"❌ Error capturando screenshot: {e}")
            return False
    
    def render_configuration(self, driver: webdriver.Chrome, config: Dict, index: int) -> Dict:
        """Renderizar una configuración específica"""
        result = {
            "config": config,
            "index": index,
            "status": "failed",
            "filename": None,
            "angles": [],
            "errors": []
        }
        
        try:
            filename = self.generate_filename(config, index)
            filepath = os.path.join(self.output_dir, filename)
            
            # Navegar a la página
            print(f"🌐 Navegando a configurador...")
            driver.get(self.base_url)
            time.sleep(5)
            
            # Esperar canvas
            if not self.wait_for_canvas(driver):
                result["errors"].append("Canvas no encontrado")
                return result
            
            # Aplicar configuración
            if not self.apply_configuration(driver, config):
                result["errors"].append("No se pudo aplicar configuración")
                return result
            
            # Capturar múltiples ángulos
            angles = self.rotate_watch_for_multiple_angles(driver)
            
            # Capturar screenshot principal
            if self.capture_screenshot(driver, filepath):
                result["status"] = "success"
                result["filename"] = filename
                result["angles"] = angles
                
                # Capturar ángulos adicionales
                for i, angle_name in enumerate(angles):
                    angle_filename = filename.replace("_selenium.png", f".{angle_name}.png")
                    angle_filepath = os.path.join(self.output_dir, angle_filename)
                    
                    if self.capture_screenshot(driver, angle_filepath):
                        result["angles"].append(f"{angle_name}_captured")
                
            return result
            
        except Exception as e:
            result["errors"].append(str(e))
            return result
    
    def generate_report(self, results: List[Dict]) -> str:
        """Generar reporte de renderizado"""
        successful = [r for r in results if r["status"] == "success"]
        failed = [r for r in results if r["status"] == "failed"]
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_configurations": len(self.configurations),
            "successful_renders": len(successful),
            "failed_renders": len(failed),
            "success_rate": f"{len(successful)/len(self.configurations)*100:.1f}%",
            "output_directory": self.output_dir,
            "base_url": self.base_url,
            "total_files_generated": sum(len(r.get("angles", [])) + (1 if r["status"] == "success" else 0) for r in results),
            "method": "selenium_python",
            "successful_configs": [
                {
                    "index": r["index"],
                    "case": r["config"]["case"],
                    "dial": r["config"]["dial"], 
                    "filename": r["filename"],
                    "angles_captured": r["angles"]
                } for r in successful
            ],
            "failed_configs": [
                {
                    "index": r["index"],
                    "case": r["config"]["case"],
                    "dial": r["config"]["dial"],
                    "errors": r["errors"]
                } for r in failed
            ]
        }
        
        report_path = os.path.join(self.output_dir, "selenium_render_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return report_path, report
    
    def render_all_configurations(self):
        """Renderizar todas las configuraciones"""
        print("🚀 INICIANDO RENDERIZADO AUTOMÁTICO CON SELENIUM")
        print("=" * 60)
        print(f"📊 Total de configuraciones: {len(self.configurations)}")
        print(f"📁 Directorio de salida: {self.output_dir}")
        print(f"🔗 URL del configurador: {self.base_url}")
        print("=" * 60)
        
        driver = None
        results = []
        
        try:
            # Crear driver
            print("🔧 Configurando Chrome WebDriver...")
            driver = self.setup_driver()
            print("✅ WebDriver configurado correctamente")
            
            # Renderizar cada configuración
            for i, config in enumerate(self.configurations):
                print(f"\n🎨 Renderizando {i+1}/{len(self.configurations)}: {config['case']} - {config['dial']}")
                
                result = self.render_configuration(driver, config, i+1)
                results.append(result)
                
                if result["status"] == "success":
                    print(f"✅ Éxito: {result['filename']}")
                else:
                    print(f"❌ Fallo: {result['errors']}")
                
                # Pausa entre configuraciones
                if i < len(self.configurations) - 1:
                    print(f"⏳ Esperando {self.delay_between_screenshots} segundos...")
                    time.sleep(self.delay_between_screenshots)
            
            # Generar reporte
            report_path, report = self.generate_report(results)
            
            print("\n🎯 RENDERIZADO COMPLETADO")
            print("=" * 40)
            print(f"✅ Renders exitosos: {report['successful_renders']}/{report['total_configurations']}")
            print(f"📈 Tasa de éxito: {report['success_rate']}")
            print(f"📁 Archivos generados: {report['total_files_generated']}")
            print(f"📁 Directorio: {self.output_dir}")
            print(f"📄 Reporte: {report_path}")
            
            # Mostrar algunos ejemplos exitosos
            if report["successful_configs"]:
                print("\n🎉 EJEMPLOS DE RENDERS EXITOSOS:")
                for config in report["successful_configs"][:3]:
                    print(f"   {config['case']} - {config['dial']} → {config['filename']}")
            
        except KeyboardInterrupt:
            print("\n⏹️ Renderizado interrumpido por el usuario")
        except Exception as e:
            print(f"\n❌ Error crítico: {e}")
        finally:
            if driver:
                driver.quit()
                print("🔧 WebDriver cerrado correctamente")

def main():
    """Función principal"""
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("🧪 Modo de prueba - renderizando 3 configuraciones")
        renderer = WatchRenderer()
        renderer.configurations = renderer.configurations[:3]  # Solo 3 para prueba
        renderer.render_all_configurations()
    else:
        renderer = WatchRenderer()
        renderer.render_all_configurations()

if __name__ == "__main__":
    main()