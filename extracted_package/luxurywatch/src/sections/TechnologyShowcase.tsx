import { TrendingUp, DollarSign, ArrowDown } from 'lucide-react'

const benefits = [
  {
    icon: TrendingUp,
    value: '+40%',
    label: 'Incremento en Conversión',
    description: 'Los configuradores 3D aumentan las tasas de conversión hasta un 40% comparado con imágenes estáticas.',
  },
  {
    icon: ArrowDown,
    value: '-30%',
    label: 'Reducción de Devoluciones',
    description: 'La visualización realista reduce las devoluciones en un 30%, mejorando la satisfacción del cliente.',
  },
  {
    icon: DollarSign,
    value: '+20%',
    label: 'Aumento en Ticket Promedio',
    description: 'La personalización premium incrementa el valor promedio de pedido en 15-20%.',
  },
]

const TechnologyShowcase = () => {
  return (
    <section id="tecnologia" className="section-padding bg-neutral-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Demo Image */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-lg overflow-hidden shadow-modal">
              <img
                src="/images/configuradores_3d_6.png"
                alt="Configurador 3D"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <p className="text-sm md:text-base font-medium tracking-wide uppercase mb-2">
                  Tecnología de Vanguardia
                </p>
                <h3 className="text-2xl md:text-3xl font-headline font-semibold">
                  React Three Fiber + WebGL
                </h3>
              </div>
            </div>
          </div>

          {/* Right: Benefits */}
          <div className="order-1 lg:order-2">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl lg:text-h2 font-headline font-semibold text-neutral-900 mb-6">
                Tecnología 3D + AR
              </h2>
              <p className="text-lg md:text-xl text-neutral-700 leading-relaxed mb-12">
                Nuestro configurador 3D y realidad aumentada transforman la experiencia de compra, generando resultados medibles para el negocio.
              </p>

              {/* Benefits List */}
              <div className="space-y-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
                      <benefit.icon size={24} className="text-gold-700" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-3xl md:text-4xl font-headline font-bold text-gold-500">
                          {benefit.value}
                        </span>
                        <span className="text-lg md:text-xl font-medium text-neutral-900">
                          {benefit.label}
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-neutral-700 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tech Stack */}
              <div className="mt-12 p-6 md:p-8 bg-neutral-50 rounded-md border border-neutral-200">
                <p className="text-xs md:text-sm font-medium tracking-widest uppercase text-neutral-500 mb-4">
                  Stack Tecnológico
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Three.js', 'React Three Fiber', 'WebGL', 'AR Quick Look', 'WebXR API'].map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 bg-white rounded-full text-sm font-medium text-neutral-700 border border-neutral-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TechnologyShowcase
