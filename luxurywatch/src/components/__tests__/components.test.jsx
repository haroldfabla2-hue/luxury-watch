/**
 * Tests para componentes React principales
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock de servicios
jest.mock('../lib/api', () => ({
  getProducts: jest.fn(),
  createProduct: jest.fn(),
  getCustomers: jest.fn(),
  sendChatMessage: jest.fn()
}));

// Importar componentes a testear
import App from '../App';
import WatchConfigurator3D from '../components/WatchConfigurator3D';
import CRMDashboard from '../components/CRMDashboard';
import AIChat from '../components/AIChat';

describe('App Component', () => {
  test('debería renderizar la aplicación sin errores', () => {
    render(<App />);
    expect(screen.getByText(/LuxuryWatch/i)).toBeInTheDocument();
  });

  test('debería mostrar la navegación principal', () => {
    render(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText(/Configurador/i)).toBeInTheDocument();
    expect(screen.getByText(/CRM/i)).toBeInTheDocument();
    expect(screen.getByText(/Chat IA/i)).toBeInTheDocument();
  });

  test('debería cambiar de vista al hacer clic en navegación', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Hacer clic en CRM
    const crmButton = screen.getByText(/CRM/i);
    await user.click(crmButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Gestión de Clientes/i)).toBeInTheDocument();
    });
  });
});

describe('WatchConfigurator3D Component', () => {
  const mockOnConfigChange = jest.fn();

  beforeEach(() => {
    // Mock de Three.js
    global.THREE = {
      Scene: jest.fn(),
      PerspectiveCamera: jest.fn(),
      WebGLRenderer: jest.fn(),
      BoxGeometry: jest.fn(),
      MeshStandardMaterial: jest.fn(),
      Mesh: jest.fn(),
      AmbientLight: jest.fn(),
      DirectionalLight: jest.fn(),
      OrbitControls: jest.fn()
    };
  });

  test('debería renderizar el configurador 3D', () => {
    render(
      <WatchConfigurator3D 
        watchConfig={{}} 
        onConfigChange={mockOnConfigChange}
      />
    );
    
    expect(screen.getByText(/Configurador 3D/i)).toBeInTheDocument();
    expect(screen.getByTestId('watch-3d-canvas')).toBeInTheDocument();
  });

  test('debería mostrar opciones de personalización', () => {
    const watchConfig = {
      caseMaterial: 'gold',
      strapMaterial: 'leather',
      dialColor: 'blue'
    };

    render(
      <WatchConfigurator3D 
        watchConfig={watchConfig} 
        onConfigChange={mockOnConfigChange}
      />
    );
    
    expect(screen.getByText(/Oro/i)).toBeInTheDocument();
    expect(screen.getByText(/Cuero/i)).toBeInTheDocument();
    expect(screen.getByText(/Azul/i)).toBeInTheDocument();
  });

  test('debería llamar onConfigChange al cambiar opciones', async () => {
    const user = userEvent.setup();
    render(
      <WatchConfigurator3D 
        watchConfig={{}} 
        onConfigChange={mockOnConfigChange}
      />
    );
    
    // Simular cambio de material
    const materialButton = screen.getByText(/Plata/i);
    await user.click(materialButton);
    
    await waitFor(() => {
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({
          caseMaterial: 'silver'
        })
      );
    });
  });

  test('debería manejar errores de WebGL', () => {
    // Mock de error de WebGL
    const originalError = console.error;
    console.error = jest.fn();
    
    // Mock de WebGL no disponible
    const mockWebGL = { getContext: () => null };
    Object.defineProperty(global, 'document', {
      value: {
        createElement: () => ({ getContext: () => null })
      }
    });
    
    render(
      <WatchConfigurator3D 
        watchConfig={{}} 
        onConfigChange={mockOnConfigChange}
      />
    );
    
    expect(screen.getByText(/WebGL no disponible/i)).toBeInTheDocument();
    
    console.error = originalError;
  });
});

describe('CRMDashboard Component', () => {
  const mockOnCustomerSelect = jest.fn();

  const mockCustomers = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+1234567890',
      totalOrders: 5,
      totalSpent: 15000
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@example.com',
      phone: '+0987654321',
      totalOrders: 2,
      totalSpent: 8000
    }
  ];

  test('debería renderizar el dashboard de CRM', () => {
    render(
      <CRMDashboard 
        customers={mockCustomers}
        onCustomerSelect={mockOnCustomerSelect}
      />
    );
    
    expect(screen.getByText(/Dashboard CRM/i)).toBeInTheDocument();
    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
    expect(screen.getByText(/María García/i)).toBeInTheDocument();
  });

  test('debería mostrar estadísticas de clientes', () => {
    render(
      <CRMDashboard 
        customers={mockCustomers}
        onCustomerSelect={mockOnCustomerSelect}
      />
    );
    
    expect(screen.getByText(/Total Clientes: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/€23,000/i)).toBeInTheDocument();
  });

  test('debería filtrar clientes por búsqueda', async () => {
    const user = userEvent.setup();
    render(
      <CRMDashboard 
        customers={mockCustomers}
        onCustomerSelect={mockOnCustomerSelect}
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/Buscar clientes/i);
    await user.type(searchInput, 'Juan');
    
    await waitFor(() => {
      expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      expect(screen.queryByText(/María García/i)).not.toBeInTheDocument();
    });
  });

  test('debería mostrar modal al seleccionar cliente', async () => {
    const user = userEvent.setup();
    render(
      <CRMDashboard 
        customers={mockCustomers}
        onCustomerSelect={mockOnCustomerSelect}
      />
    );
    
    const customerCard = screen.getByText(/Juan Pérez/i).closest('[data-testid="customer-card"]');
    await user.click(customerCard);
    
    expect(mockOnCustomerSelect).toHaveBeenCalledWith(mockCustomers[0]);
  });
});

describe('AIChat Component', () => {
  const mockOnMessageSent = jest.fn();

  const mockMessages = [
    {
      id: 1,
      message: 'Hola, ¿qué productos tienen?',
      response: 'Hola! Tenemos una gran variedad de relojes de lujo...',
      timestamp: new Date()
    }
  ];

  test('debería renderizar el chat de IA', () => {
    render(
      <AIChat 
        messages={mockMessages}
        onMessageSent={mockOnMessageSent}
        isLoading={false}
      />
    );
    
    expect(screen.getByText(/Chat IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Hola, ¿qué productos tienen?/i)).toBeInTheDocument();
    expect(screen.getByText(/Hola! Tenemos una gran variedad/i)).toBeInTheDocument();
  });

  test('debería enviar mensaje al presionar Enter', async () => {
    const user = userEvent.setup();
    render(
      <AIChat 
        messages={[]}
        onMessageSent={mockOnMessageSent}
        isLoading={false}
      />
    );
    
    const messageInput = screen.getByPlaceholderText(/Escribe tu mensaje/i);
    await user.type(messageInput, '¿Tienen relojes de oro?');
    await user.keyPress(messageInput, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnMessageSent).toHaveBeenCalledWith('¿Tienen relojes de oro?');
  });

  test('debería mostrar indicador de carga', () => {
    render(
      <AIChat 
        messages={[]}
        onMessageSent={mockOnMessageSent}
        isLoading={true}
      />
    );
    
    expect(screen.getByText(/Escribiendo.../i)).toBeInTheDocument();
  });

  test('debería limpiar input después de enviar mensaje', async () => {
    const user = userEvent.setup();
    render(
      <AIChat 
        messages={[]}
        onMessageSent={mockOnMessageSent}
        isLoading={false}
      />
    );
    
    const messageInput = screen.getByPlaceholderText(/Escribe tu mensaje/i);
    await user.type(messageInput, 'Mensaje de prueba');
    
    // Simular envío exitoso
    mockOnMessageSent.mockImplementation(() => {});
    await user.keyPress(messageInput, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(messageInput).toHaveValue('');
    });
  });
});

describe('Navigation Component', () => {
  test('debería resaltar la página activa', () => {
    render(
      <Navigation activePage="configurator" onPageChange={jest.fn()} />
    );
    
    const activeLink = screen.getByText(/Configurador/i);
    expect(activeLink.closest('a')).toHaveClass('active');
  });

  test('debería cambiar de página al hacer clic', async () => {
    const user = userEvent.setup();
    const mockOnPageChange = jest.fn();
    
    render(
      <Navigation activePage="configurator" onPageChange={mockOnPageChange} />
    );
    
    const crmLink = screen.getByText(/CRM/i);
    await user.click(crmLink);
    
    expect(mockOnPageChange).toHaveBeenCalledWith('crm');
  });
});

describe('Error Boundary Component', () => {
  test('debería capturar errores de JavaScript', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const OriginalErrorBoundary = ErrorBoundary;
    
    // Mock del ErrorBoundary para testing
    const ErrorBoundary = ({ children }) => {
      return children;
    };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
  });
});

// Test de integración: Flujo completo de configuración de reloj
describe('Integración: Configuración de Reloj', () => {
  test('debería permitir configurar un reloj completo y guardarlo', async () => {
    const user = userEvent.setup();
    const mockSaveConfig = jest.fn();
    
    render(
      <App />
    );
    
    // Ir al configurador
    const configuratorLink = screen.getByText(/Configurador/i);
    await user.click(configuratorLink);
    
    // Seleccionar material
    const goldButton = screen.getByText(/Oro/i);
    await user.click(goldButton);
    
    // Seleccionar correa
    const leatherButton = screen.getByText(/Cuero/i);
    await user.click(leatherButton);
    
    // Seleccionar color de esfera
    const blueButton = screen.getByText(/Azul/i);
    await user.click(blueButton);
    
    // Guardar configuración
    const saveButton = screen.getByText(/Guardar Configuración/i);
    await user.click(saveButton);
    
    expect(mockSaveConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        caseMaterial: 'gold',
        strapMaterial: 'leather',
        dialColor: 'blue'
      })
    );
  });
});