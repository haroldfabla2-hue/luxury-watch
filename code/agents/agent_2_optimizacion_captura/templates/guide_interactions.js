/**
 * Guía de Interacciones JavaScript
 * Sistema de Fotogrametría de Relojes - Agente Optimizador de Captura
 */

class CaptureGuideInterface {
    constructor() {
        this.completedChecklist = new Set();
        this.currentAngle = null;
        this.init();
    }

    init() {
        this.setupChecklistInteractions();
        this.setupAngleCards();
        this.drawAngleWheel();
        this.drawLightingDiagram();
        this.setupTooltips();
        this.setupKeyboardNavigation();
    }

    setupChecklistInteractions() {
        const checklistItems = document.querySelectorAll('.checklist-item');
        
        checklistItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.toggleChecklistItem(item, index);
            });
            
            // Add keyboard support
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleChecklistItem(item, index);
                }
            });
            
            // Make items focusable
            item.setAttribute('tabindex', '0');
        });
    }

    toggleChecklistItem(item, index) {
        const isCompleted = item.classList.contains('completed');
        
        if (isCompleted) {
            item.classList.remove('completed');
            this.completedChecklist.delete(index);
            this.updateChecklistIcon(item, false);
        } else {
            item.classList.add('completed');
            this.completedChecklist.add(index);
            this.updateChecklistIcon(item, true);
        }
        
        this.updateProgress();
        this.saveState();
    }

    updateChecklistIcon(item, completed) {
        let icon = item.querySelector('.checkbox i');
        
        if (!icon) {
            const checkbox = item.querySelector('.checkbox');
            icon = document.createElement('i');
            icon.className = 'fas fa-check';
            checkbox.appendChild(icon);
        }
        
        if (completed) {
            icon.style.display = 'block';
        } else {
            icon.style.display = 'none';
        }
    }

    updateProgress() {
        const totalItems = document.querySelectorAll('.checklist-item').length;
        const completedItems = this.completedChecklist.size;
        const progress = (completedItems / totalItems) * 100;
        
        // Update progress indicator if it exists
        let progressElement = document.querySelector('.progress-indicator');
        if (!progressElement) {
            progressElement = document.createElement('div');
            progressElement.className = 'progress-indicator';
            progressElement.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${completedItems}/${totalItems} completado</span>
            `;
            
            const checklistSection = document.querySelector('.checklist-section');
            checklistSection.insertBefore(progressElement, checklistSection.querySelector('.checklist'));
        }
        
        const progressFill = progressElement.querySelector('.progress-fill');
        const progressText = progressElement.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = `${completedItems}/${totalItems} completado`;
        }
    }

    setupAngleCards() {
        const angleCards = document.querySelectorAll('.angle-card');
        
        angleCards.forEach(card => {
            card.addEventListener('click', () => {
                this.selectAngle(card);
            });
            
            card.addEventListener('mouseenter', () => {
                this.highlightAngle(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.clearAngleHighlight();
            });
        });
    }

    selectAngle(card) {
        // Remove previous selection
        document.querySelectorAll('.angle-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Select current card
        card.classList.add('selected');
        this.currentAngle = card.dataset.angle;
        
        // Update visualization
        this.updateAngleWheelSelection();
        
        // Show angle details
        this.showAngleDetails(card);
    }

    highlightAngle(card) {
        card.classList.add('highlighted');
    }

    clearAngleHighlight() {
        document.querySelectorAll('.angle-card').forEach(c => {
            c.classList.remove('highlighted');
        });
    }

    drawAngleWheel() {
        const canvas = document.getElementById('angleWheel');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw angle markers
        const angleCards = document.querySelectorAll('.angle-card');
        angleCards.forEach((card, index) => {
            const angle = parseInt(card.querySelector('.angle-value').textContent);
            const radian = (angle * Math.PI) / 180;
            
            const x = centerX + radius * Math.cos(radian);
            const y = centerY + radius * Math.sin(radian);
            
            // Draw marker
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#3498db';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw angle label
            ctx.fillStyle = '#2c3e50';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${angle}°`, x, y + 4);
            
            // Draw line from center to marker
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    updateAngleWheelSelection() {
        if (!this.currentAngle) return;
        
        const canvas = document.getElementById('angleWheel');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        const angle = parseInt(this.currentAngle);
        const radian = (angle * Math.PI) / 180;
        
        const x = centerX + radius * Math.cos(radian);
        const y = centerY + radius * Math.sin(radian);
        
        // Redraw selection highlight
        this.drawAngleWheel();
        
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    showAngleDetails(card) {
        const angle = card.querySelector('.angle-value').textContent;
        const label = card.querySelector('.angle-label').textContent;
        
        // Create or update angle details panel
        let detailsPanel = document.querySelector('.angle-details');
        if (!detailsPanel) {
            detailsPanel = document.createElement('div');
            detailsPanel.className = 'angle-details';
            detailsPanel.innerHTML = `
                <h4>Detalles del Ángulo</h4>
                <div class="details-content"></div>
            `;
            card.parentNode.appendChild(detailsPanel);
        }
        
        const detailsContent = detailsPanel.querySelector('.details-content');
        detailsContent.innerHTML = `
            <p><strong>Ángulo:</strong> ${angle}</p>
            <p><strong>Vista:</strong> ${label}</p>
            <p><strong>Recomendaciones:</strong> ${this.getAngleRecommendations(angle)}</p>
        `;
    }

    getAngleRecommendations(angle) {
        const recommendations = {
            '0': 'Vista frontal directa. Ideal para mostrar la cara principal del componente.',
            '45': 'Vista 3/4. Proporciona profundidad y dimensión.',
            '90': 'Vista lateral. Perfecta para mostrar el grosor y perfiles.',
            '135': 'Vista superior/posterior. Útil para mostrar elementos traseros.',
            '180': 'Vista posterior completa. Muestra la cara opuesta.',
            '30': 'Vista diagonal suave. Resalta texturas y patrones.',
            '60': 'Vista diagonal pronunciada. Crea efectos dramáticos.',
            '120': 'Vista diagonal invertida. Proporciona perspectiva única.',
            '150': 'Vista casi posterior. Completa la cobertura circular.',
            '225': 'Vista inferior lateral. Captura detalles de la base.',
            '270': 'Vista inferior. Útil para elementos de montaje.',
            '315': 'Vista diagonal inferior. Completa la perspectiva 3D.'
        };
        
        return recommendations[angle] || 'Ángulo personalizado según geometría del componente.';
    }

    drawLightingDiagram() {
        const canvas = document.getElementById('lightingDiagram');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw component (center circle)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#f8f9fa';
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw lighting positions
        const lightingConfigs = document.querySelectorAll('.lighting-config');
        lightingConfigs.forEach((config, index) => {
            const position = config.querySelector('.lighting-name').textContent.toLowerCase();
            const intensity = parseFloat(config.querySelector('.lighting-value').textContent);
            
            let lightX = centerX;
            let lightY = centerY;
            
            // Calculate light position based on description
            switch(position) {
                case 'superior':
                case 'superior_frontal':
                    lightX = centerX;
                    lightY = centerY - 80;
                    break;
                case 'lateral':
                case 'lateral_izquierda':
                    lightX = centerX - 80;
                    lightY = centerY;
                    break;
                case 'lateral_derecha':
                    lightX = centerX + 80;
                    lightY = centerY;
                    break;
                case 'inferior':
                    lightX = centerX;
                    lightY = centerY + 80;
                    break;
                case 'posterior':
                    lightX = centerX;
                    lightY = centerY + 60;
                    break;
                case 'fill_light':
                    lightX = centerX + 60;
                    lightY = centerY + 40;
                    break;
                default:
                    // Random position for other types
                    const angle = (index * 60) * Math.PI / 180;
                    lightX = centerX + 70 * Math.cos(angle);
                    lightY = centerY + 70 * Math.sin(angle);
            }
            
            // Draw light source
            const lightRadius = 8 + (intensity * 10);
            ctx.beginPath();
            ctx.arc(lightX, lightY, lightRadius, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(243, 156, 18, ${0.6 + intensity * 0.4})`;
            ctx.fill();
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw light beam
            ctx.beginPath();
            ctx.moveTo(lightX, lightY);
            ctx.lineTo(centerX, centerY);
            ctx.strokeStyle = `rgba(243, 156, 18, ${intensity})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Add light label
            ctx.fillStyle = '#2c3e50';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(position.replace('_', ' '), lightX, lightY + 20);
        });
    }

    setupTooltips() {
        // Simple tooltip implementation
        const elements = document.querySelectorAll('[title]');
        
        elements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('title'));
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #2c3e50;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        setTimeout(() => tooltip.style.opacity = '1', 10);
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSelection();
            } else if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                const angleCards = document.querySelectorAll('.angle-card');
                if (angleCards[index]) {
                    angleCards[index].click();
                }
            }
        });
    }

    clearSelection() {
        document.querySelectorAll('.angle-card').forEach(c => {
            c.classList.remove('selected');
        });
        this.currentAngle = null;
        this.updateAngleWheelSelection();
        
        // Remove angle details
        const detailsPanel = document.querySelector('.angle-details');
        if (detailsPanel) {
            detailsPanel.remove();
        }
    }

    saveState() {
        const state = {
            completedChecklist: Array.from(this.completedChecklist),
            currentAngle: this.currentAngle,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('captureGuideState', JSON.stringify(state));
    }

    loadState() {
        try {
            const saved = localStorage.getItem('captureGuideState');
            if (saved) {
                const state = JSON.parse(saved);
                this.completedChecklist = new Set(state.completedChecklist || []);
                this.currentAngle = state.currentAngle;
                
                // Restore checklist state
                const checklistItems = document.querySelectorAll('.checklist-item');
                checklistItems.forEach((item, index) => {
                    if (this.completedChecklist.has(index)) {
                        item.classList.add('completed');
                        this.updateChecklistIcon(item, true);
                    }
                });
                
                this.updateProgress();
                
                // Restore angle selection
                if (this.currentAngle) {
                    const angleCard = document.querySelector(`[data-angle="${this.currentAngle}"]`);
                    if (angleCard) {
                        angleCard.click();
                    }
                }
            }
        } catch (error) {
            console.warn('Could not load saved state:', error);
        }
    }

    exportSettings() {
        const settings = {
            checklist: Array.from(this.completedChecklist),
            currentAngle: this.currentAngle,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `capture-guide-settings-${Date.now()}.json`;
        link.click();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const guideInterface = new CaptureGuideInterface();
    guideInterface.loadState();
    
    // Make interface globally available for debugging
    window.captureGuideInterface = guideInterface;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CaptureGuideInterface;
}