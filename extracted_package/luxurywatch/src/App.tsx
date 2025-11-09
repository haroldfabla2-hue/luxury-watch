import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import ConfiguratorPage from './pages/ConfiguratorPage'
import OptimizedConfiguratorPage from './pages/OptimizedConfiguratorPage'
import AIConfiguratorPage from './pages/AIConfiguratorPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminDashboard from './pages/AdminDashboard'
import BlogPage from './pages/BlogPage'
import MarketplacePage from './pages/MarketplacePage'
import GranularSystemDemo from './components/GranularSystemDemo'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/configurador" element={<ConfiguratorPage />} />
          <Route path="/configurador-optimizado" element={<OptimizedConfiguratorPage />} />
          <Route path="/configurador-ia" element={<AIConfiguratorPage />} />
          <Route path="/demo-granular" element={<GranularSystemDemo />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
