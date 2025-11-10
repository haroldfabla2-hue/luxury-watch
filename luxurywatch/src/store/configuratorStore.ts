import { create } from 'zustand'
import api from '../lib/api'

// Types actualizados para el nuevo backend
export interface WatchMaterial {
  id: string
  name: string
  type: 'METAL' | 'CERAMIC' | 'LEATHER' | 'RUBBER' | 'TEXTILE' | 'PRECIOUS_METAL' | 'EXOTIC'
  price: number
  density?: number
  color?: string
  finish?: string
  description?: string
  properties?: any
  createdAt: string
  updatedAt: string
}

export interface WatchCase {
  id: string
  name: string
  shape: string
  diameter: number
  thickness: number
  lugWidth?: number
  materialId: string
  price: number
  waterResistance?: number
  crystal?: string
  description?: string
  material?: WatchMaterial
  createdAt: string
  updatedAt: string
}

export interface WatchDial {
  id: string
  name: string
  color: string
  finish?: string
  hourMarkers: string
  materialId?: string
  material?: WatchMaterial
  price: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface WatchHands {
  id: string
  name: string
  style: string
  color: string
  size: string
  materialId?: string
  material?: WatchMaterial
  price: number
  createdAt: string
  updatedAt: string
}

export interface WatchStrap {
  id: string
  name: string
  type: 'LEATHER' | 'METAL' | 'RUBBER' | 'NATO' | 'PERLON' | 'CLOTH'
  materialId?: string
  material?: WatchMaterial
  color: string
  width: number
  length?: number
  buckleType?: string
  price: number
  createdAt: string
  updatedAt: string
}

export interface WatchConfiguration {
  id: string
  name: string
  materialId: string
  caseId: string
  dialId: string
  handsId: string
  strapId: string
  totalPrice: number
  description?: string
  renderSettings?: any
  previewUrl?: string
  createdAt: string
  updatedAt: string
  // Relaciones
  material?: WatchMaterial
  watchCase?: WatchCase
  watchDial?: WatchDial
  watchHands?: WatchHands
  watchStrap?: WatchStrap
}

interface ConfiguratorState {
  // Estado de carga
  loading: boolean
  error: string | null

  // Componentes disponibles
  materials: WatchMaterial[]
  cases: WatchCase[]
  dials: WatchDial[]
  hands: WatchHands[]
  straps: WatchStrap[]

  // Configuración actual
  selectedMaterial: WatchMaterial | null
  selectedCase: WatchCase | null
  selectedDial: WatchDial | null
  selectedHands: WatchHands | null
  selectedStrap: WatchStrap | null

  // Configuración completa
  currentConfiguration: WatchConfiguration | null
  isValidConfiguration: boolean
  totalPrice: number

  // Configuraciones guardadas
  savedConfigurations: WatchConfiguration[]

  // Acciones
  fetchComponents: () => Promise<void>
  selectMaterial: (material: WatchMaterial) => void
  selectCase: (watchCase: WatchCase) => void
  selectDial: (dial: WatchDial) => void
  selectHands: (hands: WatchHands) => void
  selectStrap: (strap: WatchStrap) => void
  validateConfiguration: () => Promise<boolean>
  calculatePrice: () => Promise<number>
  saveConfiguration: (name: string, description?: string) => Promise<string>
  loadConfiguration: (id: string) => Promise<void>
  clearConfiguration: () => void
  resetStore: () => void
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  // Estado inicial
  loading: false,
  error: null,

  materials: [],
  cases: [],
  dials: [],
  hands: [],
  straps: [],

  selectedMaterial: null,
  selectedCase: null,
  selectedDial: null,
  selectedHands: null,
  selectedStrap: null,

  currentConfiguration: null,
  isValidConfiguration: false,
  totalPrice: 0,

  savedConfigurations: [],

  // Acciones
  fetchComponents: async () => {
    try {
      set({ loading: true, error: null })
      
      const response = await api.getWatchComponents()
      
      if (response.success) {
        set({
          materials: response.data.materials || [],
          cases: response.data.cases || [],
          dials: response.data.dials || [],
          hands: response.data.hands || [],
          straps: response.data.straps || []
        })
      } else {
        throw new Error('Error cargando componentes')
      }
    } catch (error) {
      console.error('Error cargando componentes:', error)
      set({ error: 'Error cargando componentes del configurador' })
    } finally {
      set({ loading: false })
    }
  },

  selectMaterial: (material: WatchMaterial) => {
    set({ selectedMaterial: material })
    get().validateConfiguration()
  },

  selectCase: (watchCase: WatchCase) => {
    set({ selectedCase: watchCase })
    get().validateConfiguration()
  },

  selectDial: (dial: WatchDial) => {
    set({ selectedDial: dial })
    get().validateConfiguration()
  },

  selectHands: (hands: WatchHands) => {
    set({ selectedHands: hands })
    get().validateConfiguration()
  },

  selectStrap: (strap: WatchStrap) => {
    set({ selectedStrap: strap })
    get().validateConfiguration()
  },

  validateConfiguration: async () => {
    try {
      const { selectedMaterial, selectedCase, selectedDial, selectedHands, selectedStrap } = get()
      
      if (!selectedMaterial || !selectedCase || !selectedDial || !selectedHands || !selectedStrap) {
        set({ isValidConfiguration: false, totalPrice: 0 })
        return false
      }

      const config = {
        materialId: selectedMaterial.id,
        caseId: selectedCase.id,
        dialId: selectedDial.id,
        handsId: selectedHands.id,
        strapId: selectedStrap.id
      }

      const response = await api.validateConfiguration(config)
      
      if (response.success) {
        set({ 
          isValidConfiguration: response.data.valid,
          totalPrice: response.data.price || 0
        })
        return response.data.valid
      } else {
        set({ isValidConfiguration: false, totalPrice: 0 })
        return false
      }
    } catch (error) {
      console.error('Error validando configuración:', error)
      set({ isValidConfiguration: false, totalPrice: 0 })
      return false
    }
  },

  calculatePrice: async () => {
    try {
      const { selectedMaterial, selectedCase, selectedDial, selectedHands, selectedStrap } = get()
      
      if (!selectedMaterial || !selectedCase || !selectedDial || !selectedHands || !selectedStrap) {
        return 0
      }

      const config = {
        materialId: selectedMaterial.id,
        caseId: selectedCase.id,
        dialId: selectedDial.id,
        handsId: selectedHands.id,
        strapId: selectedStrap.id
      }

      const response = await api.calculateConfigurationPrice(config)
      
      if (response.success) {
        const price = response.data.price || 0
        set({ totalPrice: price })
        return price
      } else {
        return 0
      }
    } catch (error) {
      console.error('Error calculando precio:', error)
      return 0
    }
  },

  saveConfiguration: async (name: string, description?: string) => {
    try {
      const { selectedMaterial, selectedCase, selectedDial, selectedHands, selectedStrap } = get()
      
      if (!selectedMaterial || !selectedCase || !selectedDial || !selectedHands || !selectedStrap) {
        throw new Error('Configuración incompleta')
      }

      const config = {
        name,
        description,
        materialId: selectedMaterial.id,
        caseId: selectedCase.id,
        dialId: selectedDial.id,
        handsId: selectedHands.id,
        strapId: selectedStrap.id,
        totalPrice: get().totalPrice
      }

      const response = await api.saveConfiguration(config)
      
      if (response.success) {
        // Actualizar configuración actual
        set({ currentConfiguration: response.data })
        
        // Agregar a configuraciones guardadas
        const { savedConfigurations } = get()
        set({ 
          savedConfigurations: [response.data, ...savedConfigurations]
        })
        
        return response.data.id
      } else {
        throw new Error(response.message || 'Error guardando configuración')
      }
    } catch (error) {
      console.error('Error guardando configuración:', error)
      throw error
    }
  },

  loadConfiguration: async (id: string) => {
    try {
      set({ loading: true, error: null })
      
      // Cargar configuración desde API
      const response = await api.request(`/api/configurations/${id}`)
      
      if (response.success) {
        const config = response.data
        
        // Encontrar los componentes en el store
        const { materials, cases, dials, hands, straps } = get()
        
        const material = materials.find(m => m.id === config.materialId)
        const watchCase = cases.find(c => c.id === config.caseId)
        const dial = dials.find(d => d.id === config.dialId)
        const hand = hands.find(h => h.id === config.handsId)
        const strap = straps.find(s => s.id === config.strapId)
        
        if (material && watchCase && dial && hand && strap) {
          set({
            selectedMaterial: material,
            selectedCase: watchCase,
            selectedDial: dial,
            selectedHands: hand,
            selectedStrap: strap,
            currentConfiguration: config,
            isValidConfiguration: true,
            totalPrice: config.totalPrice
          })
        } else {
          throw new Error('Componentes no encontrados para esta configuración')
        }
      } else {
        throw new Error('Configuración no encontrada')
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
      set({ error: 'Error cargando configuración' })
    } finally {
      set({ loading: false })
    }
  },

  clearConfiguration: () => {
    set({
      selectedMaterial: null,
      selectedCase: null,
      selectedDial: null,
      selectedHands: null,
      selectedStrap: null,
      currentConfiguration: null,
      isValidConfiguration: false,
      totalPrice: 0
    })
  },

  resetStore: () => {
    set({
      loading: false,
      error: null,
      materials: [],
      cases: [],
      dials: [],
      hands: [],
      straps: [],
      selectedMaterial: null,
      selectedCase: null,
      selectedDial: null,
      selectedHands: null,
      selectedStrap: null,
      currentConfiguration: null,
      isValidConfiguration: false,
      totalPrice: 0,
      savedConfigurations: []
    })
  }
}))

export default useConfiguratorStore