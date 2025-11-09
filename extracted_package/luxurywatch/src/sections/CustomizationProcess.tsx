const steps = [
  {
    number: 1,
    title: 'Selecciona Caja y Tamaño',
    description: 'Elige entre 36-40mm, siguiendo las tendencias 2025. Formas clásicas y contemporáneas disponibles.',
    image: '/images/esferas_personalizadas_0.jpg',
  },
  {
    number: 2,
    title: 'Escoge Esfera y Color',
    description: 'Negro profundo, azul océano o verde menta tendencia. Texturas sunburst, granuladas o sólidas.',
    image: '/images/esferas_personalizadas_2.jpg',
  },
  {
    number: 3,
    title: 'Define el Material',
    description: 'Oro 18K, cerámica técnica o titanio Grado 5. Cada material con propiedades únicas.',
    image: '/images/esferas_personalizadas_4.jpeg',
  },
  {
    number: 4,
    title: 'Personaliza la Correa',
    description: 'Cuero premium, malla milanesa o silicona deportiva. Sistema de cambio rápido incluido.',
    image: '/images/configuradores_3d_4.jpg',
  },
]

const CustomizationProcess = () => {
  return (
    <section id="personalizacion" className="section-padding bg-neutral-50">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-h2 font-headline font-semibold text-neutral-900 mb-6">
            Proceso de Personalización
          </h2>
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            En cuatro pasos simples, crea un reloj único que refleja tu personalidad y estilo. Visualización en tiempo real en cada etapa.
          </p>
        </div>

        {/* Timeline - Desktop */}
        <div className="hidden md:flex items-start justify-between relative">
          {/* Connector Line */}
          <div className="absolute top-7 left-0 right-0 h-0.5 bg-titanium-500" style={{ width: 'calc(100% - 56px)', left: '28px' }} />

          {steps.map((step, index) => (
            <div key={step.number} className="relative flex-1 flex flex-col items-center" style={{ maxWidth: '280px' }}>
              {/* Number Badge */}
              <div className="relative z-10 w-14 h-14 rounded-full bg-gold-500 flex items-center justify-center text-neutral-900 font-bold text-2xl mb-4">
                {step.number}
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-h4 font-headline font-medium text-neutral-900 mb-3 text-center">
                {step.title}
              </h3>
              <p className="text-sm md:text-body text-neutral-700 leading-relaxed text-center mb-6">
                {step.description}
              </p>

              {/* Image */}
              <div className="w-full aspect-square rounded-md overflow-hidden shadow-card">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Timeline - Mobile */}
        <div className="md:hidden space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              {/* Number Badge */}
              <div className="w-14 h-14 rounded-full bg-gold-500 flex items-center justify-center text-neutral-900 font-bold text-2xl mb-4">
                {step.number}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-headline font-medium text-neutral-900 mb-3 text-center">
                {step.title}
              </h3>
              <p className="text-base text-neutral-700 leading-relaxed text-center mb-6 max-w-sm">
                {step.description}
              </p>

              {/* Image */}
              <div className="w-full max-w-xs aspect-square rounded-md overflow-hidden shadow-card">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CustomizationProcess
