const trends = [
  {
    title: 'Tamaños Compactos',
    trend: '36-40mm dominan el mercado',
    description: 'El declive de los relojes XL continúa. Los tamaños clásicos 36-40mm representan el 68% de las ventas premium 2025.',
    image: '/images/tendencias_2025_2.jpg',
  },
  {
    title: 'Colores Audaces',
    trend: 'Verde menta y pasteles emergen',
    description: 'Más allá del negro y azul tradicional, los verdes menta/pistacho y tonos pastel son la tendencia disruptiva del año.',
    image: '/images/tendencias_2025_6.jpg',
  },
  {
    title: 'Materiales Técnicos',
    trend: 'Cerámica y titanio en auge',
    description: 'Los materiales high-tech crecen +45%. Oro amarillo y rosa también retornan con fuerza (+32% vs 2024).',
    image: '/images/tendencias_2025_8.jpg',
  },
]

const TrendsInspiration = () => {
  return (
    <section id="tendencias" className="section-padding bg-neutral-50">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-h2 font-headline font-semibold text-neutral-900 mb-6">
            Tendencias 2025
          </h2>
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            Basado en análisis de 8 marcas premium y datos de mercado. Diseña con las tendencias que definirán la relojería de lujo.
          </p>
        </div>

        {/* Trends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16">
          {trends.map((trend, index) => (
            <div key={index} className="group">
              {/* Image */}
              <div className="relative h-64 md:h-80 rounded-md overflow-hidden shadow-card mb-6">
                <img
                  src={trend.image}
                  alt={trend.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs md:text-sm font-medium tracking-widest uppercase text-gold-500 mb-2">
                    Tendencia {index + 1}
                  </p>
                  <h3 className="text-xl md:text-2xl font-headline font-semibold text-white">
                    {trend.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="px-2">
                <p className="text-base md:text-lg font-medium text-gold-700 mb-3">
                  {trend.trend}
                </p>
                <p className="text-sm md:text-base text-neutral-700 leading-relaxed">
                  {trend.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Key Stats */}
        <div className="bg-neutral-100 rounded-lg p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-headline font-semibold text-neutral-900 mb-8 text-center">
            Datos Clave del Mercado 2025
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-headline font-bold text-gold-500 mb-2">68%</div>
              <p className="text-sm md:text-base text-neutral-700">Relojes 36-40mm</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-headline font-bold text-gold-500 mb-2">+45%</div>
              <p className="text-sm md:text-base text-neutral-700">Crecimiento Cerámica</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-headline font-bold text-gold-500 mb-2">+32%</div>
              <p className="text-sm md:text-base text-neutral-700">Oro Amarillo/Rosa</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-headline font-bold text-gold-500 mb-2">Top 3</div>
              <p className="text-sm md:text-base text-neutral-700">Colores: Negro, Azul, Verde</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrendsInspiration
