import { Check, X } from 'lucide-react'

const comparison = {
  features: [
    'Configurador 3D en Tiempo Real',
    'Vista Previa 360° Interactiva',
    'Realidad Aumentada (AR)',
    'IA para Recomendaciones',
    'Marketplace Diseñadores',
    'Blog CMS Educativo',
    'Panel Admin Completo',
    'Programa de Fidelización',
  ],
  competitors: [
    { name: 'LuxuryWatch', values: [true, true, true, true, true, true, true, true] },
    { name: 'luxury-mods.fr', values: [false, false, false, false, false, true, false, false] },
    { name: 'Competidor B', values: [true, false, false, false, false, false, false, false] },
    { name: 'Competidor C', values: [false, true, false, false, false, true, false, false] },
  ],
}

const CompetitiveEdge = () => {
  return (
    <section id="competencia" className="section-padding bg-neutral-100">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-h2 font-headline font-semibold text-neutral-900 mb-6">
            Ventaja Competitiva
          </h2>
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            Superamos a la competencia en tecnología, experiencia de usuario y funcionalidades avanzadas.
          </p>
        </div>

        {/* Comparison Table - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full bg-neutral-50 rounded-lg shadow-card">
            <thead>
              <tr className="border-b-2 border-neutral-200">
                <th className="text-left p-6 font-headline font-semibold text-neutral-900 text-lg">
                  Funcionalidad
                </th>
                {comparison.competitors.map((comp) => (
                  <th
                    key={comp.name}
                    className={`p-6 font-headline font-semibold text-lg ${
                      comp.name === 'LuxuryWatch'
                        ? 'bg-gold-100 text-gold-900'
                        : 'text-neutral-700'
                    }`}
                  >
                    {comp.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.features.map((feature, featureIndex) => (
                <tr key={featureIndex} className="border-b border-neutral-200">
                  <td className="p-6 text-neutral-700">{feature}</td>
                  {comparison.competitors.map((comp, compIndex) => (
                    <td
                      key={compIndex}
                      className={`p-6 text-center ${
                        comp.name === 'LuxuryWatch' ? 'bg-gold-50' : ''
                      }`}
                    >
                      {comp.values[featureIndex] ? (
                        <Check size={24} className="mx-auto text-success" />
                      ) : (
                        <X size={24} className="mx-auto text-error" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comparison Cards - Mobile */}
        <div className="md:hidden space-y-6">
          {comparison.competitors.map((comp, compIndex) => (
            <div
              key={comp.name}
              className={`rounded-lg p-6 ${
                comp.name === 'LuxuryWatch'
                  ? 'bg-gold-100 border-2 border-gold-500'
                  : 'bg-neutral-50 border border-neutral-200'
              }`}
            >
              <h3 className="text-xl font-headline font-semibold text-neutral-900 mb-4">
                {comp.name}
              </h3>
              <div className="space-y-3">
                {comparison.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">{feature}</span>
                    {comp.values[featureIndex] ? (
                      <Check size={20} className="text-success flex-shrink-0" />
                    ) : (
                      <X size={20} className="text-error flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CompetitiveEdge
