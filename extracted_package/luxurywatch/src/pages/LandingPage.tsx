import NavigationModern from '../components/Modern/NavigationModern'
import Hero from '../sections/Hero'
import ValueProposition from '../sections/ValueProposition'
import MaterialsShowcase from '../sections/MaterialsShowcase'
import CustomizationProcess from '../sections/CustomizationProcess'
import TechnologyShowcase from '../sections/TechnologyShowcase'
import TrendsInspiration from '../sections/TrendsInspiration'
import CompetitiveEdge from '../sections/CompetitiveEdge'
import CTAFinal from '../sections/CTAFinal'

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <NavigationModern />
      <main>
        <Hero />
        <ValueProposition />
        <MaterialsShowcase />
        <CustomizationProcess />
        <TechnologyShowcase />
        <TrendsInspiration />
        <CompetitiveEdge />
        <CTAFinal />
      </main>
      <footer className="bg-ceramic-900 text-neutral-100 py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-headline font-bold text-gold-500 mb-4">LuxuryWatch</h3>
              <p className="text-neutral-300 leading-relaxed">
                Diseña relojes de lujo personalizados con tecnología 3D de vanguardia. Materiales premium y artesanía excepcional.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-lg font-headline font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#materiales" className="text-neutral-300 hover:text-gold-500 transition-colors">Materiales</a></li>
                <li><a href="#personalizacion" className="text-neutral-300 hover:text-gold-500 transition-colors">Personalización</a></li>
                <li><a href="#tecnologia" className="text-neutral-300 hover:text-gold-500 transition-colors">Tecnología</a></li>
                <li><a href="#tendencias" className="text-neutral-300 hover:text-gold-500 transition-colors">Tendencias 2025</a></li>
                <li><a href="/configurador" className="text-neutral-300 hover:text-gold-500 transition-colors">Configurador 3D</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-headline font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-neutral-300">
                <li>Email: info@luxurywatch.com</li>
                <li>Teléfono: +34 900 123 456</li>
                <li>Horario: Lun-Vie 9:00-18:00</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-neutral-700 pt-8 text-center text-neutral-400 text-sm">
            <p>© 2025 LuxuryWatch. Todos los derechos reservados. | Diseñado con pasión por la relojería de lujo.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
