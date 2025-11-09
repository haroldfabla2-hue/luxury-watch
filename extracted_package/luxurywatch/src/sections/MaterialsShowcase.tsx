const materials = [
  {
    id: 1,
    name: 'Oro Amarillo 18K',
    badge: 'ORO',
    description: 'Oro amarillo de 18 quilates con 75% de pureza. Calidez atemporal y prestigio incomparable.',
    image: '/images/componentes_relojes_0.jpg',
    specs: [
      'Pureza 75% (18K)',
      'Peso: 40g aprox.',
      'Acabado pulido espejo',
      'Resistencia a corrosión',
    ],
    color: 'gold',
  },
  {
    id: 2,
    name: 'Cerámica Técnica',
    badge: 'CERÁMICA',
    description: 'Cerámica de alta tecnología con dureza excepcional. Resistente a rayones y ligera.',
    image: '/images/componentes_relojes_5.jpg',
    specs: [
      'Dureza VHN 1500',
      'Anti-arañazos',
      'Hipoalergénica',
      'Acabado mate premium',
    ],
    color: 'ceramic',
  },
  {
    id: 3,
    name: 'Titanio Grado 5',
    badge: 'TITANIO',
    description: 'Titanio aeroespacial Grado 5 con resistencia superior. 40% más ligero que el acero.',
    image: '/images/componentes_relojes_9.jpg',
    specs: [
      'Grado 5 aeroespacial',
      'Anti-corrosivo',
      'Peso ultra ligero: 25g',
      'Biocompatible',
    ],
    color: 'titanium',
  },
]

const MaterialsShowcase = () => {
  return (
    <section id="materiales" className="section-padding-lg bg-neutral-100">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-h2 font-headline font-semibold text-neutral-900 mb-6">
            Materiales Premium
          </h2>
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            Cada material es seleccionado por sus propiedades excepcionales y belleza atemporal. Descubre la ciencia detrás del lujo.
          </p>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-neutral-50 rounded-md shadow-card hover:shadow-card-hover transition-all duration-luxury overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={material.image}
                  alt={material.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                />
                {/* Badge */}
                <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-medium tracking-widest ${
                  material.color === 'gold' ? 'bg-gold-500 text-neutral-900' :
                  material.color === 'ceramic' ? 'bg-ceramic-900 text-neutral-50' :
                  'bg-titanium-500 text-neutral-50'
                }`}>
                  {material.badge}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-10">
                <h3 className="text-2xl md:text-h3 font-headline font-semibold text-neutral-900 mb-4">
                  {material.name}
                </h3>
                <p className="text-base md:text-body text-neutral-700 leading-relaxed mb-6">
                  {material.description}
                </p>

                {/* Specs List */}
                <ul className="space-y-3">
                  {material.specs.map((spec, index) => (
                    <li key={index} className="flex items-start text-sm md:text-body-small text-neutral-700">
                      <span className="mr-3 text-gold-500">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Link */}
                <a
                  href="/configurador"
                  className="inline-block mt-6 text-gold-500 hover:text-gold-700 font-medium text-sm md:text-base underline underline-offset-4 transition-colors duration-fast"
                >
                  Ver en configurador
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MaterialsShowcase
