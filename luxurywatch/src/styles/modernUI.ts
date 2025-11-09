/**
 * ESTILOS MODERNOS UI/UX 2025
 * Sistema de estilos avanzado con micro-interacciones y animaciones suaves
 */

import React from 'react'

// Tipos para las props de los componentes modernos
export interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'luxury' | 'outline' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  animate?: boolean
}

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: 'scale' | 'lift' | 'glow' | 'holographic' | 'flip'
  interactive?: boolean
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
}

// Estilos CSS modernos integrados
export const modernStyles = `
/* ========== BOTONES MODERNOS CON MICRO-INTERACCIONES ========== */
.modern-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  border: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  transform-style: preserve-3d;
}

.modern-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modern-btn:hover:before {
  left: 100%;
}

.modern-btn-luxury {
  background: linear-gradient(135deg, #D4AF37 0%, #F4E4B5 50%, #C9A961 100%);
  color: #1A1D20;
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.modern-btn-luxury:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 12px 40px rgba(212, 175, 55, 0.4), 0 0 0 1px rgba(255,255,255,0.1);
  filter: brightness(110%);
}

.modern-btn-secondary {
  background: linear-gradient(135deg, #2C2F33 0%, #1F2125 100%);
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modern-btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #3A3D43 0%, #26282D 100%);
}

/* Efecto Ripple para botones */
.modern-btn:active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

/* ========== TARJETAS MODERNAS CON EFECTOS AVANZADOS ========== */
.modern-card {
  position: relative;
  background: white;
  border-radius: 16px;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.modern-card-interactive {
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.modern-card-interactive:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border-color: rgba(212, 175, 55, 0.2);
}

/* Efecto Holográfico */
.modern-card-holographic {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.modern-card-holographic:before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  transition: all 0.6s ease;
  opacity: 0;
}

.modern-card-holographic:hover:before {
  opacity: 1;
  animation: holographic-shine 1.5s ease-in-out;
}

.modern-card-holographic:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
}

@keyframes holographic-shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  50% { transform: translateX(0%) translateY(0%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

/* Efecto Glassmorfismo */
.modern-card-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.modern-card-glass:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* ========== EFECTOS DE GLOW Y BRILLO ========== */
.glow-effect {
  position: relative;
}

.glow-effect::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #D4AF37, #F4E4B5, #C9A961, #D4AF37);
  border-radius: inherit;
  z-index: -1;
  animation: rotate-glow 4s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glow-effect:hover::before {
  opacity: 1;
}

@keyframes rotate-glow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ========== ANIMACIONES DE ENTRADA ========== */
.fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.fade-in-up-delayed {
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== EFECTOS DE ESCALADO 3D ========== */
.scale-3d {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-style: preserve-3d;
}

.scale-3d:hover {
  transform: scale(1.05) rotateY(5deg);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

/* ========== INDICADORES DE ESTADO MODERNOS ========== */
.status-indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status-indicator.success {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.status-indicator.loading {
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.status-indicator.error {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

/* ========== SISTEMA DE ESPACIADO MEJORADO ========== */
.spacing-xl { padding: 2rem; }
.spacing-lg { padding: 1.5rem; }
.spacing-md { padding: 1rem; }
.spacing-sm { padding: 0.75rem; }

.margin-xl { margin: 2rem; }
.margin-lg { margin: 1.5rem; }
.margin-md { margin: 1rem; }
.margin-sm { margin: 0.75rem; }

/* ========== GRADIENTES PREMIUM ========== */
.gradient-premium {
  background: linear-gradient(135deg, #D4AF37 0%, #F4E4B5 25%, #C9A961 50%, #B8860B 75%, #D4AF37 100%);
  background-size: 300% 300%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-dark {
  background: linear-gradient(135deg, #1A1D20 0%, #2C2F33 50%, #3A3D43 100%);
}

/* ========== MEJORAS PARA RESPONSIVE ========== */
@media (max-width: 768px) {
  .modern-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
  }
  
  .modern-card {
    margin-bottom: 1rem;
  }
  
  .fade-in-up,
  .fade-in-up-delayed {
    animation-duration: 0.4s;
  }
}

/* ========== ACCESIBILIDAD Y REDUCCIÓN DE MOVIMIENTO ========== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`

export default modernStyles