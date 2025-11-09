import { ChevronDown } from 'lucide-react'

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-ceramic-700 via-ceramic-900 to-neutral-900"
    >
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: 'url(/images/configuradores_3d_1.png)',
          backgroundBlendMode: 'multiply',
        }}
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-display font-headline font-bold text-neutral-50 text-balance">
            Diseña el Reloj de Tus Sueños
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-2xl lg:text-body-large text-neutral-100 max-w-3xl mx-auto leading-relaxed">
            Configura tu reloj de lujo personalizado con materiales premium: oro 18K, titanio aeroespacial y cerámica high-tech. Visualízalo en 3D en tiempo real.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center pt-8">
            <a
              href="/configurador"
              className="btn-metallic-gold px-8 md:px-12 py-4 md:py-5 rounded-sm text-base md:text-lg w-full sm:w-auto"
            >
              Comenzar Diseño
            </a>
            <a
              href="#materiales"
              className="px-8 md:px-12 py-4 md:py-5 rounded-sm text-base md:text-lg border-2 border-neutral-50 text-neutral-50 hover:bg-neutral-100 hover:text-neutral-900 hover:border-gold-500 transition-all duration-standard w-full sm:w-auto"
            >
              Explorar Materiales
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-scroll-indicator">
        <ChevronDown size={32} className="text-neutral-100" />
      </div>
    </section>
  )
}

export default Hero
