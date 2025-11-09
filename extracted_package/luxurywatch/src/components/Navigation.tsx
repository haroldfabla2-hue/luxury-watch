import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#materiales', label: 'Materiales' },
    { href: '#personalizacion', label: 'Personalización' },
    { href: '#tecnologia', label: 'Tecnología' },
    { href: '#tendencias', label: 'Tendencias' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-standard ${
        isScrolled ? 'bg-neutral-50 shadow-card' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2">
            <div className="text-2xl md:text-3xl font-headline font-bold text-gold-500">
              LuxuryWatch
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-neutral-700 hover:text-gold-500 transition-colors duration-fast font-light tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/configurador-ia"
              className="relative px-6 md:px-8 py-3 md:py-4 rounded-sm text-sm md:text-base bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                IA Configurador
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </a>
            <a
              href="/configurador-optimizado"
              className="relative px-6 md:px-8 py-3 md:py-4 rounded-sm text-sm md:text-base bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Ultra Rápido
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </a>
            <a
              href="/configurador"
              className="btn-metallic-gold px-6 md:px-8 py-3 md:py-4 rounded-sm text-sm md:text-base"
            >
              Configurador 3D
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-neutral-700 hover:text-gold-500"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-50 border-t border-neutral-200 shadow-card">
          <div className="container mx-auto px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-neutral-700 hover:text-gold-500 transition-colors duration-fast py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/configurador-ia"
              className="block px-6 py-3 rounded-sm text-center text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              IA Configurador
            </a>
            <a
              href="/configurador-optimizado"
              className="block px-6 py-3 rounded-sm text-center text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ultra Rápido
            </a>
            <a
              href="/configurador"
              className="block btn-metallic-gold px-6 py-3 rounded-sm text-center text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Configurador 3D
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation
