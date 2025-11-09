import { useState, useEffect } from 'react'
import { Menu, X, Sparkles, Zap, Settings } from 'lucide-react'

interface NavigationLink {
  href: string
  label: string
  icon?: React.ReactNode
}

const NavigationModern = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    const handleActiveSection = () => {
      const sections = ['materiales', 'personalizacion', 'tecnologia', 'tendencias']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('scroll', handleActiveSection)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleActiveSection)
    }
  }, [])

  const navLinks: NavigationLink[] = [
    { href: '#materiales', label: 'Materiales' },
    { href: '#personalizacion', label: 'Personalización' },
    { href: '#tecnologia', label: 'Tecnología' },
    { href: '#tendencias', label: 'Tendencias' },
  ]

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled 
            ? 'backdrop-blur-xl bg-white/90 shadow-modern-lg border-b border-white/20' 
            : 'backdrop-blur-md bg-gradient-to-r from-white/80 via-white/70 to-white/80'
        }`}
        style={{
          background: isScrolled 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.75) 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gold-50/10 via-transparent to-purple-50/10 pointer-events-none" />
        
        <div className="relative container mx-auto px-6 md:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            
            {/* Logo with Enhanced Animation */}
            <a href="#" className="group relative flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-600 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative text-2xl md:text-3xl font-bold bg-gradient-to-r from-gold-600 via-gold-500 to-gold-700 bg-clip-text text-transparent font-headline tracking-tight">
                  LuxuryWatch
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative group px-4 py-2 rounded-xl text-sm lg:text-base font-medium tracking-wide transition-all duration-300 ${
                    activeSection === link.href.replace('#', '')
                      ? 'text-gold-600 bg-gradient-to-r from-gold-50 to-gold-100/50'
                      : 'text-neutral-700 hover:text-gold-600 hover:bg-gradient-to-r hover:from-gold-50/50 hover:to-purple-50/30'
                  }`}
                >
                  {/* Background glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-400/0 via-gold-400/10 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  
                  {/* Main content */}
                  <span className="relative z-10 flex items-center gap-2">
                    {link.label}
                    {activeSection === link.href.replace('#', '') && (
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 animate-pulse" />
                    )}
                  </span>

                  {/* Hover underline effect */}
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/configurador-ia"
                className="group relative overflow-hidden px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-modern-xl"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 50%, #1E1B4B 100%)',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-500 opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  IA Configurador
                </span>
              </a>
              
              <a
                href="/configurador-optimizado"
                className="group relative overflow-hidden px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-modern-xl"
                style={{
                  background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 50%, #155E75 100%)',
                  boxShadow: '0 2px 8px rgba(8, 145, 178, 0.2)'
                }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-teal-400 to-cyan-500 opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  Ultra Rápido
                </span>
              </a>
              
              <a
                href="/configurador"
                className="group relative overflow-hidden px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-modern-xl"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-500 opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                
                <span className="relative z-10 flex items-center gap-2">
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                  Configurador 3D
                </span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden group relative p-2 rounded-xl text-neutral-700 hover:text-gold-600 hover:bg-gradient-to-r hover:from-gold-50 hover:to-purple-50/30 transition-all duration-300"
              aria-label="Toggle menu"
            >
              <div className="relative">
                <Menu className={`w-6 h-6 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`} />
                <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-xl bg-black/20 animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile menu content */}
          <div className="relative mt-20 mx-4 animate-slideInDown">
            <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-modern-xl border border-white/20 overflow-hidden">
              
              {/* Navigation Links */}
              <div className="p-6 space-y-2">
                {navLinks.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center justify-between p-4 rounded-xl text-neutral-700 hover:text-gold-600 hover:bg-gradient-to-r hover:from-gold-50 hover:to-purple-50/30 transition-all duration-300 ${
                      activeSection === link.href.replace('#', '') ? 'text-gold-600 bg-gradient-to-r from-gold-50 to-gold-100/50' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="font-medium tracking-wide">{link.label}</span>
                    {activeSection === link.href.replace('#', '') && (
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 animate-pulse" />
                    )}
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-300 group-hover:border-gold-400 transition-colors duration-300" />
                  </a>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

              {/* CTA Buttons */}
              <div className="p-6 space-y-3">
                <a
                  href="/configurador-ia"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4" />
                  IA Configurador
                </a>
                
                <a
                  href="/configurador-optimizado"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
                    boxShadow: '0 2px 8px rgba(8, 145, 178, 0.2)'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Zap className="w-4 h-4" />
                  Ultra Rápido
                </a>
                
                <a
                  href="/configurador"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Configurador 3D
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navigation */}
      <div className="h-20 md:h-24" />
    </>
  )
}

export default NavigationModern