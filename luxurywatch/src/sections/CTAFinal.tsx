import { Check } from 'lucide-react'

const benefits = [
  'Configurador 3D interactivo en tiempo real',
  'Materiales premium: Oro 18K, Titanio, Cerámica',
  'Realidad aumentada para probarlo virtualmente',
  'Garantía extendida de 5 años incluida',
]

const CTAFinal = () => {
  return (
    <section id="cta-final" className="section-padding-lg bg-gradient-to-br from-ceramic-700 via-ceramic-900 to-neutral-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(184, 134, 11, 0.3) 1px, transparent 0)`,
          backgroundSize: '48px 48px',
        }} />
      </div>

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-h1 font-headline font-bold text-neutral-50 mb-6">
            Comienza a Diseñar Tu Reloj Único
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-2xl text-neutral-100 leading-relaxed mb-12 max-w-2xl mx-auto">
            Únete a cientos de entusiastas que ya han creado su reloj de lujo personalizado. Tu diseño te espera.
          </p>

          {/* Benefits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start text-left space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center mt-1">
                  <Check size={16} className="text-white" />
                </div>
                <span className="text-base md:text-lg text-neutral-100">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
            <a
              href="/configurador"
              className="btn-metallic-gold px-10 md:px-14 py-5 md:py-6 rounded-sm text-lg md:text-xl w-full sm:w-auto"
            >
              Configurar Mi Reloj
            </a>
            <a
              href="#contacto"
              className="px-10 md:px-14 py-5 md:py-6 rounded-sm text-lg md:text-xl border-2 border-neutral-100 text-neutral-100 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-standard w-full sm:w-auto"
            >
              Agendar Consulta
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-12 border-t border-neutral-700">
            <div className="grid grid-cols-3 gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-headline font-bold text-gold-500 mb-2">500+</div>
                <p className="text-sm md:text-base text-neutral-300">Relojes Personalizados</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-headline font-bold text-gold-500 mb-2">98%</div>
                <p className="text-sm md:text-base text-neutral-300">Satisfacción Cliente</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-headline font-bold text-gold-500 mb-2">5 Años</div>
                <p className="text-sm md:text-base text-neutral-300">Garantía Extendida</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTAFinal
