import { Eye, Sparkles, Users, Zap } from 'lucide-react'

const features = [
  {
    icon: Eye,
    title: 'Configurador 3D en Tiempo Real',
    description: 'Visualiza tu reloj desde todos los ángulos con renderizado fotorrealista. Cambia materiales, colores y componentes instantáneamente.',
  },
  {
    icon: Sparkles,
    title: 'Realidad Aumentada Móvil',
    description: 'Pruébate tu diseño virtualmente con AR. Compatible con iOS AR Quick Look y Android AR Core para experiencia inmersiva.',
  },
  {
    icon: Users,
    title: 'Marketplace de Diseñadores',
    description: 'Accede a diseños exclusivos de artesanos independientes. Conecta con maestros relojeros para piezas únicas.',
  },
  {
    icon: Zap,
    title: 'IA para Recomendaciones',
    description: 'Algoritmo inteligente que sugiere combinaciones basadas en tu estilo, ocasión y preferencias personales.',
  },
]

const ValueProposition = () => {
  return (
    <section id="propuesta" className="section-padding bg-neutral-50">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-h2 font-headline font-semibold text-neutral-900 mb-6">
            ¿Por Qué LuxuryWatch?
          </h2>
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            Transformamos la experiencia de compra de relojes de lujo con tecnología de vanguardia y personalización sin límites.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-luxury border border-neutral-200 hover:border-gold-500 group"
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-standard">
                  <feature.icon size={32} className="text-gold-700 group-hover:text-white transition-colors duration-standard" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl md:text-h4 font-headline font-medium text-neutral-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-base md:text-body text-neutral-700 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ValueProposition
